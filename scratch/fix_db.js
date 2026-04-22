const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // USE SERVICE ROLE
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log('Fixing Database Schema...');
  
  const sql = `
  -- listings table
  CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    category TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    seller_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- listing_images table
  CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- marketplace_messages table
  CREATE TABLE IF NOT EXISTS marketplace_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL,
    sender_name TEXT,
    sender_phone TEXT,
    receiver_id TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  -- Enable RLS
  ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;
  ALTER TABLE marketplace_messages ENABLE ROW LEVEL SECURITY;

  -- Simple Public Access for now (or Authenticated)
  DROP POLICY IF EXISTS "Public Select" ON listings;
  CREATE POLICY "Public Select" ON listings FOR SELECT TO authenticated USING (true);
  
  DROP POLICY IF EXISTS "Public Insert" ON listings;
  CREATE POLICY "Public Insert" ON listings FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Select Images" ON listing_images;
  CREATE POLICY "Public Select Images" ON listing_images FOR SELECT TO authenticated USING (true);

  DROP POLICY IF EXISTS "Public Insert Images" ON listing_images;
  CREATE POLICY "Public Insert Images" ON listing_images FOR INSERT TO authenticated WITH CHECK (true);

  DROP POLICY IF EXISTS "Public Messages" ON marketplace_messages;
  CREATE POLICY "Public Messages" ON marketplace_messages FOR ALL TO authenticated USING (true);
  `;

  // Supabase JS doesn't support raw SQL easily unless we use RPC or direct pg
  // But we can check if table exists and then insert a dummy row to test
  try {
    const { data: d1, error: e1 } = await supabase.from('listings').select('*').limit(1);
    if (e1) {
       console.error('Error selecting from listings:', e1.message);
       console.log('You likely need to run the SQL set above in your Supabase SQL Editor.');
    } else {
       console.log('Listings table is accessible.');
    }
  } catch (e) {
    console.error(e);
  }
}

fix();
