/*
  # Performance Optimization - Add Indexes

  1. Indexes Added
    - Profile queries by ID (auth foreign key)
    - Workspace lookups by owner
    - Link queries by user and workspace
    - Link clicks for analytics aggregation
    - Custom slug lookups (for redirect)
    - Folder queries

  2. Benefits
    - Faster link lookups for redirects
    - Improved analytics queries
    - Better workspace management
    - Optimized user profile access
*/

-- Ensure common query paths are indexed
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_workspaces_owner_created ON workspaces(owner_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_links_user_created ON links(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_links_workspace_created ON links(workspace_id, created_at DESC) WHERE workspace_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_links_custom_slug_active ON links(custom_slug) WHERE custom_slug IS NOT NULL AND is_active = true;

CREATE INDEX IF NOT EXISTS idx_link_clicks_created ON link_clicks(clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_link_clicks_link_created ON link_clicks(link_id, clicked_at DESC);

CREATE INDEX IF NOT EXISTS idx_folders_workspace ON folders(workspace_id);

CREATE INDEX IF NOT EXISTS idx_domains_workspace ON domains(workspace_id);

CREATE INDEX IF NOT EXISTS idx_qr_codes_link ON qr_codes(link_id);

-- Index for link expiration checking
CREATE INDEX IF NOT EXISTS idx_links_expires ON links(expires_at) WHERE expires_at IS NOT NULL;

-- Index for active link lookups
CREATE INDEX IF NOT EXISTS idx_links_active_created ON links(is_active, created_at DESC) WHERE is_active = true;
