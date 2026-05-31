CREATE TABLE IF NOT EXISTS domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE NOT NULL,
  domain TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, active, error
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their workspace domains" ON domains FOR ALL USING (
  workspace_id IN (SELECT id FROM workspaces WHERE owner_id = auth.uid())
);
