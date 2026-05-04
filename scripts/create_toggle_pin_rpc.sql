-- ポストのピン留め状態を切り替えるRPC（RLSをバイパスして実行）
CREATE OR REPLACE FUNCTION toggle_post_pin(
    p_post_id UUID,
    p_user_id UUID,
    p_new_status BOOLEAN
) RETURNS void AS $$
DECLARE
    v_cast_id UUID;
    v_is_admin BOOLEAN;
BEGIN
    -- ポストの所有者（cast_id）を取得
    SELECT cast_id INTO v_cast_id FROM public.sns_posts WHERE id = p_post_id;
    
    IF v_cast_id IS NULL THEN
        RAISE EXCEPTION 'Post not found';
    END IF;

    -- 実行ユーザーがシステム管理者かどうかをチェック
    SELECT EXISTS (
        SELECT 1 FROM public.sns_profiles 
        WHERE id = p_user_id AND role IN ('system', 'admin')
    ) INTO v_is_admin;

    -- ポストの所有者自身、または管理者のみが更新可能
    IF v_cast_id = p_user_id OR v_is_admin THEN
        UPDATE public.sns_posts 
        SET is_pinned = p_new_status 
        WHERE id = p_post_id;
    ELSE
        RAISE EXCEPTION 'Permission denied';
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
