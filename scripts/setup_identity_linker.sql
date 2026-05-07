-- ==========================================
-- CTIとSNSの自動名寄せシステム (Identity Linker)
-- ==========================================

-- ヘルパー関数：電話番号からハイフンなどの記号を除去し、数字のみにする
CREATE OR REPLACE FUNCTION normalize_phone(p_phone VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    IF p_phone IS NULL THEN
        RETURN NULL;
    END IF;
    -- ハイフンやスペースを除去
    RETURN REGEXP_REPLACE(p_phone, '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------
-- A. SNSに登録・更新されたときに、CTI (customers) を探すトリガー
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION link_sns_to_cti()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
DECLARE
    matched_cti_id UUID;
    norm_phone VARCHAR;
BEGIN
    -- 電話番号が存在する場合のみ実行
    IF NEW.phone IS NOT NULL THEN
        norm_phone := normalize_phone(NEW.phone);

        -- customersテーブルから、ハイフンを除去した電話番号で一致するレコードを検索
        SELECT id INTO matched_cti_id 
        FROM public.customers 
        WHERE normalize_phone(phone) = norm_phone
        LIMIT 1;

        -- 一致するCTI顧客がいればIDを保存
        IF matched_cti_id IS NOT NULL THEN
            NEW.cti_customer_id := matched_cti_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_link_sns_to_cti ON public.sns_profiles;
CREATE TRIGGER trg_link_sns_to_cti
BEFORE INSERT OR UPDATE ON public.sns_profiles
FOR EACH ROW
EXECUTE FUNCTION link_sns_to_cti();


-- ---------------------------------------------------------
-- B. CTI側に新規登録・更新されたときに、SNS (sns_profiles) を探すトリガー
-- ---------------------------------------------------------
CREATE OR REPLACE FUNCTION link_cti_to_sns()
RETURNS TRIGGER 
SECURITY DEFINER
AS $$
DECLARE
    norm_phone VARCHAR;
BEGIN
    -- 電話番号が存在する場合のみ実行
    IF NEW.phone IS NOT NULL THEN
        norm_phone := normalize_phone(NEW.phone);

        -- sns_profilesテーブルで、電話番号が一致するレコードの cti_customer_id を更新する
        UPDATE public.sns_profiles
        SET cti_customer_id = NEW.id
        WHERE normalize_phone(phone) = norm_phone
          AND cti_customer_id IS DISTINCT FROM NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_link_cti_to_sns ON public.customers;
CREATE TRIGGER trg_link_cti_to_sns
AFTER INSERT OR UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION link_cti_to_sns();
