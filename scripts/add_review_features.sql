-- 1. sns_reviews テーブルの拡張 (返信機能)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sns_reviews' AND column_name='reply_content') THEN
        ALTER TABLE public.sns_reviews ADD COLUMN reply_content text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sns_reviews' AND column_name='reply_created_at') THEN
        ALTER TABLE public.sns_reviews ADD COLUMN reply_created_at timestamp with time zone;
    END IF;
END $$;

-- 2. sns_review_likes テーブルの作成 (参考になった機能)
CREATE TABLE IF NOT EXISTS public.sns_review_likes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  review_id uuid REFERENCES public.sns_reviews(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(review_id, user_id)
);

-- RLS (sns_review_likes)
ALTER TABLE public.sns_review_likes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Everyone can read review likes" ON public.sns_review_likes;
    DROP POLICY IF EXISTS "Users can insert their own likes" ON public.sns_review_likes;
    DROP POLICY IF EXISTS "Users can delete their own likes" ON public.sns_review_likes;
EXCEPTION WHEN OTHERS THEN
END $$;

CREATE POLICY "Everyone can read review likes" 
  ON public.sns_review_likes FOR SELECT USING (true);

CREATE POLICY "Users can insert their own likes" 
  ON public.sns_review_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes" 
  ON public.sns_review_likes FOR DELETE USING (auth.uid() = user_id);

-- 3. 通報用RPC (report_review)
CREATE OR REPLACE FUNCTION report_review(
    p_review_id UUID,
    p_reporter_id UUID,
    p_reason TEXT
) RETURNS void AS $$
BEGIN
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
        'システム自動生成 (口コミ通報)',
        'system@report.local',
        NULL,
        '[口コミ通報] レビューID: ' || p_review_id || CHR(10) || '理由: ' || p_reason,
        'unread',
        NOW()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
