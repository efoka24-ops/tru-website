import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkSchema() {
  console.log('🔍 Vérification du schéma Supabase...\n');
  
  // Try to get contacts
  console.log('📋 Table: contacts');
  try {
    const { data, error } = await supabase
      .from('contacts')
     .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur contacts:', error.message);
    } else {
      console.log('✅ Colonnes contacts:', data.length > 0 ? Object.keys(data[0]) : 'Table vide');
      console.log('   Exemple:', data[0]);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }

  console.log('\n📋 Table: settings');
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur settings:', error.message);
    } else {
      console.log('✅ Colonnes settings:', data.length > 0 ? Object.keys(data[0]) : 'Table vide');
      console.log('   Exemple:', data[0]);
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkSchema();
