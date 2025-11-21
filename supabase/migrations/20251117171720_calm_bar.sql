/*
  # Green Points App Database Schema

  1. New Tables
    - `users` - User profiles with recycling stats
    - `recycling_machines` - Machine locations and status
    - `deposits` - Individual deposit records
    - `partner_stores` - Stores where users can redeem points
    - `redemptions` - Point redemption history

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
    - Admin-only access for machine and store management

  3. Features
    - Point tracking system (plastic = 5 pts, aluminum = 1 pt)
    - CO₂ impact calculation
    - Leaderboard support
    - Redemption system
*/

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  phone text,
  full_name text NOT NULL,
  is_admin boolean DEFAULT false,
  total_points integer DEFAULT 0,
  total_items integer DEFAULT 0,
  co2_saved numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Recycling machines table
CREATE TABLE IF NOT EXISTS recycling_machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'full')),
  last_emptied timestamptz DEFAULT now(),
  total_items_processed integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Deposits table (individual recycling transactions)
CREATE TABLE IF NOT EXISTS deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  machine_id uuid REFERENCES recycling_machines(id),
  material_type text NOT NULL CHECK (material_type IN ('plastic', 'aluminum')),
  quantity integer DEFAULT 1,
  points_earned integer NOT NULL,
  co2_saved numeric(8,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Partner stores table
CREATE TABLE IF NOT EXISTS partner_stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  category text NOT NULL,
  min_points_required integer DEFAULT 200,
  discount_percentage integer,
  address text NOT NULL,
  phone text,
  website text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Redemptions table
CREATE TABLE IF NOT EXISTS redemptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  partner_store_id uuid REFERENCES partner_stores(id),
  points_used integer NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  redeemed_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Recycling machines policies
CREATE POLICY "Anyone can read active machines"
  ON recycling_machines
  FOR SELECT
  TO authenticated
  USING (status = 'active');

CREATE POLICY "Admins can manage machines"
  ON recycling_machines
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Deposits policies
CREATE POLICY "Users can read own deposits"
  ON deposits
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can insert deposits"
  ON deposits
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Partner stores policies
CREATE POLICY "Anyone can read active stores"
  ON partner_stores
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage stores"
  ON partner_stores
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Redemptions policies
CREATE POLICY "Users can read own redemptions"
  ON redemptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create redemptions"
  ON redemptions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Functions to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user totals when a deposit is made
  UPDATE users 
  SET 
    total_points = total_points + NEW.points_earned,
    total_items = total_items + NEW.quantity,
    co2_saved = co2_saved + NEW.co2_saved,
    updated_at = now()
  WHERE id = NEW.user_id;
  
  -- Update machine stats
  UPDATE recycling_machines
  SET 
    total_items_processed = total_items_processed + NEW.quantity,
    updated_at = now()
  WHERE id = NEW.machine_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stats
CREATE TRIGGER update_user_stats_trigger
  AFTER INSERT ON deposits
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats();

-- Insert sample data
INSERT INTO recycling_machines (name, location, status) VALUES
  ('Machine #001', 'Central Park - Main Entrance', 'active'),
  ('Machine #002', 'Downtown Mall - Food Court', 'active'),
  ('Machine #003', 'University Campus - Student Center', 'maintenance'),
  ('Machine #004', 'Metro Station - Platform A', 'active'),
  ('Machine #005', 'Shopping Center - Parking Lot', 'full');

INSERT INTO partner_stores (name, description, category, min_points_required, discount_percentage, address, logo_url) VALUES
  ('EcoMart', 'Sustainable products and organic groceries', 'Retail', 200, 10, '123 Green Street, Eco City', 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=100'),
  ('Green Cafe', 'Organic coffee and plant-based meals', 'Restaurant', 150, 15, '456 Leaf Avenue, Eco City', 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=100'),
  ('Sustainable Style', 'Eco-friendly clothing and accessories', 'Fashion', 300, 20, '789 Earth Boulevard, Eco City', 'https://images.pexels.com/photos/1488463/pexels-photo-1488463.jpeg?auto=compress&cs=tinysrgb&w=100'),
  ('Planet Fitness', 'Eco-conscious gym and wellness center', 'Fitness', 250, 25, '321 Nature Way, Eco City', 'https://images.pexels.com/photos/1552252/pexels-photo-1552252.jpeg?auto=compress&cs=tinysrgb&w=100');