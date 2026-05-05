ALTER TABLE sns_profiles ADD COLUMN IF NOT EXISTS hide_reviews_and_favorites BOOLEAN DEFAULT FALSE;
