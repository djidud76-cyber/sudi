-- Function to delete user account completely
-- Run this in Supabase SQL Editor

CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- CASCADE in the database will delete links, link_clicks, and qr_codes automatically
  DELETE FROM workspaces WHERE owner_id = current_user_id;
  DELETE FROM profiles WHERE id = current_user_id;
  -- Deleting the user from auth is handled via Supabase Admin API on the backend
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_user_account TO authenticated;
