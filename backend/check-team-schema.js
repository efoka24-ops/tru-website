import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function checkTeamSchema() {
  console.log('🔍 Vérification du schéma team...\n');
  
  try {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Erreur:', error.message);
    } else {
      console.log('✅ Colonnes team:', data.length > 0 ? Object.keys(data[0]) : 'Table vide');
      if (data.length > 0) {
        console.log('\n📋 Exemple:');
        console.log(JSON.stringify(data[0], null, 2));
      }
    }
  } catch (err) {
    console.error('❌ Exception:', err.message);
  }
}

checkTeamSchema();
