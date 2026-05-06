-- sns_posts テーブルに quoted_review_id カラムを追加
ALTER TABLE public.sns_posts 
ADD COLUMN IF NOT EXISTS quoted_review_id UUID REFERENCES public.sns_reviews(id) ON DELETE SET NULL;

-- 検索を高速化するためのインデックス
CREATE INDEX IF NOT EXISTS idx_sns_posts_quoted_review_id ON public.sns_posts(quoted_review_id);
