-- sns_postsテーブルに固定ポスト（ピン留め）用のカラムを追加
ALTER TABLE public.sns_posts 
ADD COLUMN is_pinned BOOLEAN DEFAULT false;

-- 既存のデータに対する初期化（念のため）
UPDATE public.sns_posts SET is_pinned = false WHERE is_pinned IS NULL;
