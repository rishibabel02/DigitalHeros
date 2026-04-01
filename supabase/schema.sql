-- ============================================================
-- Golf Charity Subscription Platform — Supabase SQL Schema
-- Run this in Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'subscriber' CHECK (role IN ('subscriber', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUBSCRIPTIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('monthly', 'yearly')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'lapsed', 'cancelled')),
  renewal_date TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  currency TEXT NOT NULL DEFAULT 'GBP',
  amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── GOLF SCORES ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS golf_scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 45),
  played_date DATE NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, played_date)
);

-- ─── CHARITIES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  image_url TEXT,
  website_url TEXT,
  upcoming_events TEXT,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── USER CHARITIES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_charities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  contribution_percentage INTEGER NOT NULL DEFAULT 10 CHECK (contribution_percentage >= 10 AND contribution_percentage <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ─── DONATIONS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  charity_id UUID NOT NULL REFERENCES charities(id),
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'GBP',
  type TEXT NOT NULL CHECK (type IN ('subscription_split', 'independent')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DRAWS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draws (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'simulated', 'published')),
  draw_logic TEXT NOT NULL DEFAULT 'random' CHECK (draw_logic IN ('random', 'algorithmic')),
  winning_numbers INTEGER[],
  jackpot_rolled_over BOOLEAN NOT NULL DEFAULT FALSE,
  jackpot_carry_forward INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(month, year)
);

-- ─── DRAW ENTRIES ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scores_snapshot INTEGER[] NOT NULL,
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(draw_id, user_id)
);

-- ─── DRAW RESULTS ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draw_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  match_type TEXT NOT NULL CHECK (match_type IN ('five', 'four', 'three')),
  winner_user_ids UUID[] NOT NULL DEFAULT '{}',
  prize_amount INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── PRIZE POOL ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS prize_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draw_id UUID NOT NULL REFERENCES draws(id) ON DELETE CASCADE UNIQUE,
  total_pool INTEGER NOT NULL DEFAULT 0,
  jackpot_pool INTEGER NOT NULL DEFAULT 0,
  four_match_pool INTEGER NOT NULL DEFAULT 0,
  three_match_pool INTEGER NOT NULL DEFAULT 0,
  jackpot_carry_forward INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'GBP',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WINNER VERIFICATIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS winner_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  draw_id UUID NOT NULL REFERENCES draws(id),
  proof_url TEXT,
  proof_file_path TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, draw_id)
);

-- ─── NOTIFICATIONS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('draw_result', 'winner_status', 'subscription_alert', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_golf_scores_user_id ON golf_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_golf_scores_played_date ON golf_scores(user_id, played_date DESC);
CREATE INDEX IF NOT EXISTS idx_draw_entries_draw_id ON draw_entries(draw_id);
CREATE INDEX IF NOT EXISTS idx_draw_entries_user_id ON draw_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_winner_verifications_user_id ON winner_verifications(user_id);

-- ─── AUTO-UPDATE updated_at ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_golf_scores_updated_at BEFORE UPDATE ON golf_scores FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_charities_updated_at BEFORE UPDATE ON charities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_charities_updated_at BEFORE UPDATE ON user_charities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_draws_updated_at BEFORE UPDATE ON draws FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_winner_verifications_updated_at BEFORE UPDATE ON winner_verifications FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ─── AUTO-CREATE PROFILE ON SIGNUP ────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE golf_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_charities ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE draws ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE draw_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE prize_pool ENABLE ROW LEVEL SECURITY;
ALTER TABLE winner_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all profiles" ON profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Subscriptions RLS
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all subscriptions" ON subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Golf Scores RLS
CREATE POLICY "Users can manage own scores" ON golf_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all scores" ON golf_scores FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Charities RLS (public read, admin write)
CREATE POLICY "Anyone can view active charities" ON charities FOR SELECT USING (is_active = TRUE);
CREATE POLICY "Admins can manage charities" ON charities FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User Charities RLS
CREATE POLICY "Users can manage own charity selection" ON user_charities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user charities" ON user_charities FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Donations RLS
CREATE POLICY "Users can view own donations" ON donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert donations" ON donations FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Admins can view all donations" ON donations FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Draws RLS (public read for published, admin write)
CREATE POLICY "Anyone can view published draws" ON draws FOR SELECT USING (status = 'published');
CREATE POLICY "Authenticated can view all draws" ON draws FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can manage draws" ON draws FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Draw Entries RLS
CREATE POLICY "Users can view own entries" ON draw_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all entries" ON draw_entries FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Draw Results RLS (public read)
CREATE POLICY "Anyone can view draw results" ON draw_results FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage draw results" ON draw_results FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Prize Pool RLS (public read)
CREATE POLICY "Anyone can view prize pool" ON prize_pool FOR SELECT USING (TRUE);
CREATE POLICY "Admins can manage prize pool" ON prize_pool FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Winner Verifications RLS
CREATE POLICY "Users can view own verifications" ON winner_verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload proof" ON winner_verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all verifications" ON winner_verifications FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications RLS
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service role can insert notifications" ON notifications FOR INSERT WITH CHECK (TRUE);

-- ─── SUPABASE STORAGE BUCKET ──────────────────────────────────
-- Run separately or via Supabase dashboard:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('winner-proofs', 'winner-proofs', false);

-- Storage RLS for winner-proofs bucket
-- CREATE POLICY "Users can upload own proof" ON storage.objects FOR INSERT WITH CHECK (
--   bucket_id = 'winner-proofs' AND auth.uid()::text = (storage.foldername(name))[1]
-- );
-- CREATE POLICY "Admins can view all proofs" ON storage.objects FOR SELECT USING (
--   bucket_id = 'winner-proofs' AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
-- );

-- ─── SEED DATA — Sample Charities ────────────────────────────
INSERT INTO charities (name, description, image_url, website_url, upcoming_events, is_featured, is_active) VALUES
  ('Cancer Research UK', 'Fighting cancer through world-class research. Every subscription contribution funds groundbreaking science.', NULL, 'https://www.cancerresearchuk.org', 'Golf Day — June 15, 2026 at Royal Birkdale', TRUE, TRUE),
  ('British Heart Foundation', 'Funding vital research and support for people living with heart and circulatory diseases.', NULL, 'https://www.bhf.org.uk', 'Charity Golf Tournament — July 20, 2026', FALSE, TRUE),
  ('MacMillan Cancer Support', 'Providing medical, emotional, practical and financial support to people living with cancer.', NULL, 'https://www.macmillan.org.uk', NULL, FALSE, TRUE),
  ('Age UK', 'Helping older people feel less isolated and more connected to their communities.', NULL, 'https://www.ageuk.org.uk', 'Annual Golf Day — August 5, 2026', FALSE, TRUE),
  ('RNLI', 'Saving lives at sea — the Royal National Lifeboat Institution saves lives 24/7.', NULL, 'https://rnli.org', NULL, FALSE, TRUE)
ON CONFLICT DO NOTHING;
