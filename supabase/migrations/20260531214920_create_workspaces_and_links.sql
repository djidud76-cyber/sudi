-- Create workspaces and add workspace references to links
-- This migration must run before RLS policies that reference workspaces

-- Add workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'personal', -- 'personal' | 'team'
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro' | 'enterprise'
  links_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add workspace_id to links (nullable for backward compat)
ALTER TABLE links ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE SET NULL;

-- Workspaces RLS (leave policies to RLS migration but enable RLS now)
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX IF NOT EXISTS idx_links_workspace ON links(workspace_id);

-- Usage tracking functions: increment/decrement links_used
CREATE OR REPLACE FUNCTION increment_workspace_links_used()
RETURNS trigger AS $$
BEGIN
  IF NEW.workspace_id IS NOT NULL THEN
    UPDATE workspaces SET links_used = workspaces.links_used + 1 WHERE id = NEW.workspace_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_link_created ON links;
CREATE TRIGGER on_link_created
  AFTER INSERT ON links
  FOR EACH ROW EXECUTE PROCEDURE increment_workspace_links_used();

CREATE OR REPLACE FUNCTION decrement_workspace_links_used()
RETURNS trigger AS $$
BEGIN
  IF OLD.workspace_id IS NOT NULL THEN
    UPDATE workspaces SET links_used = GREATEST(workspaces.links_used - 1, 0) WHERE id = OLD.workspace_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_link_deleted ON links;
CREATE TRIGGER on_link_deleted
  AFTER DELETE ON links
  FOR EACH ROW EXECUTE PROCEDURE decrement_workspace_links_used();

-- Ensure link_clicks has browser/os columns (idempotent)
ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS browser TEXT;
ALTER TABLE link_clicks ADD COLUMN IF NOT EXISTS os TEXT;
