-- 1. sns_profiles テーブルに points カラムを追加
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sns_profiles' AND column_name='points') THEN
        ALTER TABLE public.sns_profiles ADD COLUMN points integer NOT NULL DEFAULT 0;
    END IF;
END $$;

-- 2. points_history テーブルの作成
DROP TABLE IF EXISTS public.points_history;
CREATE TABLE IF NOT EXISTS public.points_history (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES public.sns_profiles(id) ON DELETE CASCADE,
    action_type text NOT NULL, -- 'daily_gacha', 'review', 'reservation', etc.
    points_added integer NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS: ユーザーは自身のポイント履歴のみ閲覧可能
ALTER TABLE public.points_history ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Users can view their own point history" ON public.points_history;
    CREATE POLICY "Users can view their own point history" ON public.points_history
        FOR SELECT
        USING (auth.uid() = user_id);
END $$;

-- 3. デイリーガチャ用 RPC (1日1回限定でポイント付与)
CREATE OR REPLACE FUNCTION public.claim_daily_gacha_points(p_user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER -- RLSをバイパスしてINSERT/UPDATEを実行
AS $$
DECLARE
    today_start timestamp with time zone := date_trunc('day', timezone('Asia/Tokyo', now()));
    existing_claim boolean;
    earned_points integer;
    new_total_points integer;
BEGIN
    -- 今日の履歴が既に存在するかチェック
    SELECT EXISTS (
        SELECT 1 FROM public.points_history
        WHERE user_id = p_user_id
          AND action_type = 'daily_gacha'
          AND created_at >= today_start
    ) INTO existing_claim;

    IF existing_claim THEN
        RETURN json_build_object('success', false, 'error', 'ALREADY_CLAIMED');
    END IF;

    -- 1〜5のランダムなポイントを生成
    earned_points := floor(random() * 5 + 1)::int;

    -- 履歴の記録
    INSERT INTO public.points_history (user_id, action_type, points_added)
    VALUES (p_user_id, 'daily_gacha', earned_points);

    -- プロフィールのポイントを更新
    UPDATE public.sns_profiles
    SET points = points + earned_points
    WHERE id = p_user_id
    RETURNING points INTO new_total_points;

    RETURN json_build_object(
        'success', true, 
        'points_added', earned_points, 
        'new_total', new_total_points
    );
END;
$$;
