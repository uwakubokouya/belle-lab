-- ==========================================
-- ネット予約の sales テーブル完全統合スクリプト
-- ==========================================

-- 1. sales テーブルの拡張
ALTER TABLE public.sales
ADD COLUMN IF NOT EXISTS is_web_reservation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS sns_profile_id UUID REFERENCES public.sns_profiles(id) ON DELETE SET NULL;

-- sales テーブルのRLSポリシー追加（SNSユーザーが自身の予約を保存・閲覧できるようにする）
DROP POLICY IF EXISTS "Users can insert their own web reservations" ON public.sales;
CREATE POLICY "Users can insert their own web reservations" 
ON public.sales FOR INSERT 
TO authenticated 
WITH CHECK (is_web_reservation = true AND sns_profile_id = auth.uid());

DROP POLICY IF EXISTS "Users can view their own web reservations" ON public.sales;
CREATE POLICY "Users can view their own web reservations" 
ON public.sales FOR SELECT 
TO authenticated 
USING (is_web_reservation = true AND sns_profile_id = auth.uid());

-- 2. 旧・複雑な同期トリガーと関数の削除
DROP TRIGGER IF EXISTS trg_sync_sales_to_sns ON public.sales;
DROP FUNCTION IF EXISTS sync_sales_to_sns();

-- 3. 新・超シンプルなポイント付与関数の作成
CREATE OR REPLACE FUNCTION award_web_reservation_points()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
BEGIN
    -- ステータスが 'exited' に変更された場合（または最初からexitedで作られた場合）
    IF NEW.status = 'exited' AND (TG_OP = 'INSERT' OR OLD.status != 'exited') THEN
        
        -- ネット予約であり、SNSアカウントが紐付いている場合のみ実行
        IF NEW.is_web_reservation = true AND NEW.sns_profile_id IS NOT NULL THEN
            
            -- ポイント付与 (二重付与防止のため action_type に sales.id を含める)
            IF NOT EXISTS (SELECT 1 FROM public.points_history WHERE user_id = NEW.sns_profile_id AND action_type = 'reservation_' || NEW.id) THEN
                
                -- 履歴の追加
                INSERT INTO public.points_history (user_id, action_type, points_added)
                VALUES (NEW.sns_profile_id, 'reservation_' || NEW.id, 10);

                -- ポイント加算 (pointsがNULLの場合は0として計算)
                UPDATE public.sns_profiles
                SET points = COALESCE(points, 0) + 10
                WHERE id = NEW.sns_profile_id;
                
            END IF;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 新・超シンプルなポイント付与トリガーの作成
DROP TRIGGER IF EXISTS trg_award_web_points ON public.sales;
CREATE TRIGGER trg_award_web_points
AFTER INSERT OR UPDATE ON public.sales
FOR EACH ROW
EXECUTE FUNCTION award_web_reservation_points();

-- 5. Realtime の有効化（ポップアップ通知用）
-- sales テーブルの変更をリアルタイムで購読できるようにします
ALTER PUBLICATION supabase_realtime ADD TABLE public.sales;
