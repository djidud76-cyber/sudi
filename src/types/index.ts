export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  type: 'personal' | 'team';
  owner_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  links_used: number;
  created_at: string;
}

export interface Link {
  id: string;
  user_id: string;
  workspace_id?: string | null;
  original_url: string;
  short_code: string;
  custom_slug?: string;
  title?: string;
  description?: string;
  password?: string;
  expires_at?: string;
  is_active: boolean;
  tags?: string[];
  created_at: string;
}

export interface LinkClick {
  id: string;
  link_id: string;
  clicked_at: string;
  ip_address?: string;
  country?: string;
  city?: string;
  device?: string;
  browser?: string;
  os?: string;
  referrer?: string;
}
