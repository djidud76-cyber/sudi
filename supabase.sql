-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Links Table
CREATE TABLE IF NOT EXISTS links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  original_url TEXT NOT NULL,
  short_code TEXT NOT NULL UNIQUE,
  custom_slug TEXT UNIQUE,
  title TEXT,
  description TEXT,
  password TEXT, -- hashed ideally, but plain text/simple hash for demo if needed
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Link Clicks Table
CREATE TABLE IF NOT EXISTS link_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  country TEXT,
  city TEXT,
  device TEXT,
  browser TEXT,
  os TEXT,
  referrer TEXT,
  ip_hash TEXT
);

-- 4. QR Codes Table
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  link_id UUID REFERENCES links(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#000000',
  bg_color TEXT DEFAULT '#ffffff',
  include_logo BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Set up Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Links RLS
CREATE POLICY "Users can view their own links" ON links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own links" ON links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own links" ON links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own links" ON links FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Public can view active links by short_code" ON links FOR SELECT USING (is_active = TRUE);

-- Link Clicks RLS
CREATE POLICY "Users can view clicks for their links" ON link_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM links WHERE links.id = link_clicks.link_id AND links.user_id = auth.uid())
);
CREATE POLICY "Anyone can insert a click" ON link_clicks FOR INSERT WITH CHECK (TRUE);

-- QR Codes RLS
CREATE POLICY "Users can view their QR codes" ON qr_codes FOR SELECT USING (
  EXISTS (SELECT 1 FROM links WHERE links.id = qr_codes.link_id AND links.user_id = auth.uid())
);
CREATE POLICY "Users can insert their QR codes" ON qr_codes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM links WHERE links.id = qr_codes.link_id AND links.user_id = auth.uid())
);
CREATE POLICY "Users can update their QR codes" ON qr_codes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM links WHERE links.id = qr_codes.link_id AND links.user_id = auth.uid())
);
CREATE POLICY "Users can delete their QR codes" ON qr_codes FOR DELETE USING (
  EXISTS (SELECT 1 FROM links WHERE links.id = qr_codes.link_id AND links.user_id = auth.uid())
);

-- Triggers to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_custom_slug ON links(custom_slug);
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
