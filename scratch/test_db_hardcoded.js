const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://zhmelokgojxlszetmtff.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpobWVsb2tnb2p4bHN6ZXRtdGZmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDM3NDgyNywiZXhwIjoyMDg5OTUwODI3fQ.-CmqAGTW4D1xqg35dhSzhJbWnFp7QW8CqjazPe5JpDQ";
const supabase = createClient(supabaseUrl, supabaseKey);

async function fix() {
  console.log('Testing Listings Table...');
  try {
    const { data, error } = await supabase.from('listings').select('title').limit(1);
    if (error) {
      console.error('ERROR:', error.message);
    } else {
      console.log('SUCCESS: Table found with', data.length, 'rows.');
    }
  } catch (e) {
    console.error('FETCH ERROR:', e);
  }
}

fix();
