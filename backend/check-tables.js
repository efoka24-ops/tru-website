import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkAndCreateTables() {
  const requiredTables = ['team', 'services', 'solutions', 'contacts', 'settings', 'jobs', 'candidature', 'actualite', 'temoignages', 'projets_realises'];
  
  try {
    // Get list of existing tables
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', requiredTables);

    if (error && error.code !== 'PGRST116') {
      console.log('Error checking tables:', error);
      return;
    }

    const existingTables = data ? data.map(t => t.table_name) : [];
    console.log('\n📊 Existing tables:', existingTables);

    const missingTables = requiredTables.filter(t => !existingTables.includes(t));
    console.log('❌ Missing tables:', missingTables);
    
    if (missingTables.length === 0) {
      console.log('✅ All required tables exist!');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAndCreateTables();
