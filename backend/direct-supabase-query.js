import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🔍 Direct Supabase query...\n');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Query team table
supabase
  .from('team')
  .select('*')
  .limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Error:', error);
    } else if (data && data.length > 0) {
      console.log('✅ Team table columns:');
      console.log(Object.keys(data[0]));
      console.log('\n📊 Sample data:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  Table is empty');
    }
  });
