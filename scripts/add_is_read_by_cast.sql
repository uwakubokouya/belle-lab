-- sns_reviews テーブルに キャスト既読フラグ を追加
ALTER TABLE public.sns_reviews 
ADD COLUMN IF NOT EXISTS is_read_by_cast BOOLEAN NOT NULL DEFAULT false;

-- 既存の承認済み口コミは既読扱いにする（オプション）
UPDATE public.sns_reviews SET is_read_by_cast = true WHERE status = 'approved';
