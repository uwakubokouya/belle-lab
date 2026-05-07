-- ==========================================
-- ネット予約ステータス同期・ポイント付与システム
-- (cti_customer_id 完全統合版)
-- ==========================================

CREATE OR REPLACE FUNCTION sync_sales_to_sns()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
DECLARE
    matched_sns_profile_id UUID;
    target_reservation RECORD;
BEGIN
    -- salesのステータスが 'exited' (退店) になった場合（UPDATEで変わった時、またはいきなりexitedでINSERTされた時）
    IF NEW.status = 'exited' AND (TG_OP = 'INSERT' OR OLD.status != 'exited') THEN
        
        -- A. まず、直接リンクされている sns_reservation_id があるか確認（Web予約経由のレコード）
        IF NEW.sns_reservation_id IS NOT NULL THEN
            SELECT * INTO target_reservation 
            FROM public.sns_reservations 
            WHERE id = NEW.sns_reservation_id AND status != 'completed'
            LIMIT 1;

            IF target_reservation IS NOT NULL THEN
                matched_sns_profile_id := target_reservation.customer_id;
            END IF;
        END IF;

        -- B. sns_reservation_id が紐付いていない場合でも、「当日のWeb予約」が存在しないかをCTI顧客IDから検索（店舗スタッフがsalesを手動作成してしまった場合の救済措置）
        IF target_reservation IS NULL AND NEW.customer_id IS NOT NULL THEN
            -- B-1. まず、名寄せ済みのID (cti_customer_id) を使って検索
            SELECT sr.* INTO target_reservation 
            FROM public.sns_reservations sr
            JOIN public.sns_profiles p ON p.id = sr.customer_id
            WHERE p.cti_customer_id = NEW.customer_id
              AND sr.cast_id = NEW.cast_id 
              AND sr.reserve_date = NEW.date
              AND sr.status != 'completed'
            LIMIT 1;

            -- B-2. 究極の保険：まだID名寄せが済んでいない（今回のシステム導入前に作られた等）アカウントの場合、CTI顧客の電話番号と予約時の電話番号で照合する
            IF target_reservation IS NULL THEN
                SELECT sr.* INTO target_reservation 
                FROM public.sns_reservations sr
                JOIN public.customers c ON public.normalize_phone(sr.customer_phone) = public.normalize_phone(c.phone)
                WHERE c.id = NEW.customer_id
                  AND sr.cast_id = NEW.cast_id 
                  AND sr.reserve_date = NEW.date
                  AND sr.status != 'completed'
                LIMIT 1;
            END IF;

            IF target_reservation IS NOT NULL THEN
                matched_sns_profile_id := target_reservation.customer_id;
            END IF;
        END IF;
        
        -- 3. ネット予約が存在した場合のみ、ステータス同期とポイント付与を実行
        IF target_reservation IS NOT NULL AND matched_sns_profile_id IS NOT NULL THEN
            
            -- 予約のステータスを 'completed' に同期
            UPDATE public.sns_reservations
            SET status = 'completed', updated_at = NOW()
            WHERE id = target_reservation.id;

            -- ポイント付与 (二重付与防止のため action_type に sns_reservations.id を含める)
            IF NOT EXISTS (SELECT 1 FROM public.points_history WHERE user_id = matched_sns_profile_id AND action_type = 'reservation_' || target_reservation.id) THEN
                
                -- 履歴の追加
                INSERT INTO public.points_history (user_id, action_type, points_added)
                VALUES (matched_sns_profile_id, 'reservation_' || target_reservation.id, 10);

                -- ポイント加算 (pointsがNULLの場合は0として計算)
                UPDATE public.sns_profiles
                SET points = COALESCE(points, 0) + 10
                WHERE id = matched_sns_profile_id;
                
            END IF;
        END IF;
    END IF;

    -- キャンセル時の同期（必要に応じて）
    IF NEW.status = 'cancelled' AND (TG_OP = 'INSERT' OR OLD.status != 'cancelled') THEN
        IF NEW.sns_reservation_id IS NOT NULL THEN
            UPDATE public.sns_reservations
            SET status = 'cancelled', updated_at = NOW()
            WHERE id = NEW.sns_reservation_id AND status = 'pending';
        ELSIF NEW.customer_id IS NOT NULL THEN
            SELECT id INTO matched_sns_profile_id 
            FROM public.sns_profiles 
            WHERE cti_customer_id = NEW.customer_id 
            LIMIT 1;

            IF matched_sns_profile_id IS NOT NULL THEN
                UPDATE public.sns_reservations
                SET status = 'cancelled', updated_at = NOW()
                WHERE customer_id = matched_sns_profile_id 
                  AND cast_id = NEW.cast_id 
                  AND reserve_date = NEW.date
                  AND status = 'pending';
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on sales table
DROP TRIGGER IF EXISTS trg_sync_sales_to_sns ON public.sales;
CREATE TRIGGER trg_sync_sales_to_sns
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION sync_sales_to_sns();

