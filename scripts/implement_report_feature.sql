-- 通報用RPCの定義
CREATE OR REPLACE FUNCTION report_user(
    p_target_id UUID,
    p_reporter_id UUID,
    p_reason TEXT
) RETURNS void AS $$
BEGIN
    -- 1. 対象ユーザーの report_count をインクリメント
    UPDATE public.sns_profiles
    SET report_count = COALESCE(report_count, 0) + 1
    WHERE id = p_target_id;

    -- 2. sns_feedbacks に通報内容を記録 (管理画面で確認できるようにする)
    INSERT INTO public.sns_feedbacks (
        user_id,
        name,
        email,
        phone,
        content,
        status,
        created_at
    ) VALUES (
        p_reporter_id,
        'システム自動生成 (通報機能)',
        'system@report.local',
        NULL,
        '[通報] ユーザーID: ' || p_target_id || ' への通報' || CHR(10) || '理由: ' || p_reason,
        'unread',
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
