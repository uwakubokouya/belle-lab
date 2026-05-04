-- 顧客管理: 通報回数記録用のカラムを追加
ALTER TABLE public.sns_profiles ADD COLUMN IF NOT EXISTS report_count INTEGER DEFAULT 0;
