const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  console.log('Testing connection...');
  const { data, error } = await supabase.from('listings').select('count', { count: 'exact', head: true });
  if (error) {
    console.error('Error with "listings" table:', error.message);
    const { data: d2, error: e2 } = await supabase.from('marketplace_listings').select('count', { count: 'exact', head: true });
    if (e2) {
      console.error('Error with "marketplace_listings" table:', e2.message);
    } else {
      console.log('Found "marketplace_listings" table instead.');
    }
  } else {
    console.log('Successfully connected to "listings" table.');
  }
}

check();
