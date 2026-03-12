import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkSchema() {
  console.log('🔍 Checking Supabase team table schema...\n');
  
  try {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Error:', error);
    } else if (data && data.length > 0) {
      console.log('✅ Team table columns:');
      const columns = Object.keys(data[0]);
      columns.forEach(col => console.log(`  - ${col}`));
      
      console.log('\n📊 Sample data:');
      console.log(JSON.stringify(data[0], null, 2));
    } else {
      console.log('⚠️  Table is empty');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkSchema();
