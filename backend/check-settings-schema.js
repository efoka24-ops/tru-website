import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkSettingsSchema() {
  console.log('🔍 Checking settingstable schema...\n');
  
  try {
    // Insert a minimal test record
    const { data, error } = await supabase
      .from('settings')
      .insert([{ key: 'test', value: 'test' }])
      .select();

    if (error) {
      console.error('❌ Error:', error);
      console.log('\n💡 Trying to describe from existing data...');
      
      // Try to select all to see structure
      const { data: allData, error: selectError } = await supabase
        .from('settings')
        .select('*')
        .limit(10);
      
      if (selectError) {
        console.error('❌ Select error:', selectError);
      } else {
        console.log('✅ Table data:', allData);
        if (allData.length > 0) {
          console.log('📋 Columns:', Object.keys(allData[0]));
        }
      }
    } else {
      console.log('✅ Table accepts key-value pairs');
      console.log('📋 Columns:', data.length > 0 ? Object.keys(data[0]) : 'Unknown');
      
      // Delete test record
      await supabase.from('settings').delete().eq('key', 'test');
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkSettingsSchema();
