CREATE OR REPLACE FUNCTION get_cast_names_by_ids(p_cast_ids text[])
RETURNS TABLE(id uuid, name text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT c.id, c.name, COALESCE(c.sns_avatar_url, c.profile_image_url, c.avatar_url) as avatar_url
  FROM casts c
  WHERE c.id::text = ANY(p_cast_ids);
END;
$$;
