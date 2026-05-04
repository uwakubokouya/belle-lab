CREATE OR REPLACE FUNCTION public.add_review_points(p_user_id uuid, p_points integer)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_total_points integer;
BEGIN
    -- 履歴の記録
    INSERT INTO public.points_history (user_id, action_type, points_added)
    VALUES (p_user_id, 'review', p_points);

    -- プロフィールのポイントを更新
    UPDATE public.sns_profiles
    SET points = points + p_points
    WHERE id = p_user_id
    RETURNING points INTO new_total_points;

    RETURN json_build_object(
        'success', true, 
        'points_added', p_points, 
        'new_total', new_total_points
    );
END;
$$;
