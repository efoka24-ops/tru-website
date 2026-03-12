import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createDefaultSettings() {
  console.log('🔧 Création des paramètres par défaut...\n');
  
 try {
    const defaultSettings = {
      site_title: 'TRU Group',
      company_name: 'TRU Group',
      slogan: 'Technology & Innovation Solutions',
      tagline: 'Your Partner for Digital Transformation',
      email: 'contact@trugroup.com',
      phone: '+237 600 00 00 00',
      address: 'Yaoundé, Cameroon',
      primary_color: '#FF6B35',
      description: 'TRU Group - Technology and Innovation Solutions',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('settings')
      .insert([defaultSettings])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        console.log('⚠️  Les paramètres existent déjà');
      } else {
        throw error;
      }
    } else {
      console.log('✅ Paramètres créés avec succès !');
      console.log('📊 Données:', data);
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createDefaultSettings();
