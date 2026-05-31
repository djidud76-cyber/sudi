-- Create folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;

-- Simple policy: Owners of the workspace can manage its folders
-- To simplify, we allow anyone authenticated to access for now if they own the workspace
-- But the actual check might require joining profiles or just relying on app-level logic 
-- For our Sudi app, let's keep it simple:
CREATE POLICY "Users can manage their workspace folders" ON folders FOR ALL USING (
  workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
);

-- Add folder_id to links table
ALTER TABLE links ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES folders(id) ON DELETE SET NULL;
