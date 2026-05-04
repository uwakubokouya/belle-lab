-- 1. sns_reviews テーブルの作成
CREATE TABLE IF NOT EXISTS public.sns_reviews (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  target_cast_id uuid REFERENCES public.casts(id) ON DELETE CASCADE,
  reviewer_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  score integer NOT NULL DEFAULT 0,
  visited_date date NOT NULL,
  content text NOT NULL,
  visibility text NOT NULL CHECK (visibility IN ('public', 'secret')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- すでにテーブルが存在する場合のためのカラム追加（エラー回避用）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sns_reviews' AND column_name='score') THEN
        ALTER TABLE public.sns_reviews ADD COLUMN score integer NOT NULL DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sns_reviews' AND column_name='visited_date') THEN
        ALTER TABLE public.sns_reviews ADD COLUMN visited_date date NOT NULL DEFAULT CURRENT_DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sns_reviews' AND column_name='visibility') THEN
        ALTER TABLE public.sns_reviews ADD COLUMN visibility text NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'secret'));
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='sns_reviews' AND column_name='status') THEN
        ALTER TABLE public.sns_reviews ADD COLUMN status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;


-- 2. profiles テーブルへのカラム追加（まだ存在しない場合）
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='is_vip') THEN
        ALTER TABLE public.profiles ADD COLUMN is_vip boolean DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='stripe_customer_id') THEN
        ALTER TABLE public.profiles ADD COLUMN stripe_customer_id text;
    END IF;
END $$;

-- 3. RLS (Row Level Security) の設定
ALTER TABLE public.sns_reviews ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public reviews are viewable by everyone if approved." ON public.sns_reviews;
    DROP POLICY IF EXISTS "Secret reviews are viewable by VIPs and Admins." ON public.sns_reviews;
    DROP POLICY IF EXISTS "Stores and Admins can view all reviews for their casts." ON public.sns_reviews;
    DROP POLICY IF EXISTS "Stores can view public reviews." ON public.sns_reviews;
    DROP POLICY IF EXISTS "Authenticated users can insert reviews." ON public.sns_reviews;
    DROP POLICY IF EXISTS "Admins can update reviews." ON public.sns_reviews;
    DROP POLICY IF EXISTS "Stores can update public reviews." ON public.sns_reviews;
    DROP POLICY IF EXISTS "Users can delete own reviews." ON public.sns_reviews;
    DROP POLICY IF EXISTS "Admins can delete any reviews." ON public.sns_reviews;
EXCEPTION WHEN OTHERS THEN
END $$;

-- 【閲覧権限】
-- public なものは approved なら誰でも見れる
CREATE POLICY "Public reviews are viewable by everyone if approved."
  ON public.sns_reviews FOR SELECT
  USING (
    (visibility = 'public' AND status = 'approved') 
    OR 
    (auth.uid() = reviewer_id)
  );

-- secret なものは approved なら VIP と運営のみ見れる
CREATE POLICY "Secret reviews are viewable by VIPs and Admins."
  ON public.sns_reviews FOR SELECT
  USING (
    visibility = 'secret' AND status = 'approved' AND (
      EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND (profiles.is_vip = true OR profiles.role IN ('admin', 'management'))
      )
    )
    OR 
    (auth.uid() = reviewer_id)
  );

-- 店舗はpublicのみ閲覧可能（審査用・自分の店舗のキャスト等の細かい絞り込みは後日追加可能）
CREATE POLICY "Stores can view public reviews."
  ON public.sns_reviews FOR SELECT
  USING (
    visibility = 'public' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'store'
    )
  );

-- 【作成権限】
CREATE POLICY "Authenticated users can insert reviews."
  ON public.sns_reviews FOR INSERT
  WITH CHECK (auth.uid() = reviewer_id);

-- 【更新権限】
CREATE POLICY "Admins can update reviews."
  ON public.sns_reviews FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'management')
    )
  );

CREATE POLICY "Stores can update public reviews."
  ON public.sns_reviews FOR UPDATE
  USING (
    visibility = 'public' AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'store'
    )
  );

-- 【削除権限】
CREATE POLICY "Users can delete own reviews."
  ON public.sns_reviews FOR DELETE
  USING (auth.uid() = reviewer_id);

CREATE POLICY "Admins can delete any reviews."
  ON public.sns_reviews FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role IN ('admin', 'management')
    )
  );

CREATE INDEX IF NOT EXISTS idx_sns_reviews_target_cast_id ON public.sns_reviews(target_cast_id);
CREATE INDEX IF NOT EXISTS idx_sns_reviews_reviewer_id ON public.sns_reviews(reviewer_id);

-- 4. RPC: VIP口コミの件数とダミーデータを取得する関数（非VIPユーザー向け）
CREATE OR REPLACE FUNCTION get_secret_review_preview(p_cast_id uuid)
RETURNS TABLE (
  count bigint,
  preview_ratings integer[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Returns the total count of approved secret reviews for a cast, and their ratings
  RETURN QUERY
  SELECT 
    COUNT(*) as count,
    array_agg(rating) as preview_ratings
  FROM public.sns_reviews
  WHERE target_cast_id = p_cast_id 
    AND visibility = 'secret' 
    AND status = 'approved';
END;
$$;
