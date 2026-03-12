import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function seedSettings() {
  console.log('🌱 Seeding default settings...\n');
  
  const defaultSettings = {
    site_title: 'TRU Group',
    company_name: 'TRU Group',
    slogan: 'Technology & Innovation Solutions',
    tagline: 'Your Partner for Digital Transformation',
    email: 'contact@trugroup.com',
    phone: '+237 600 00 00 00',
    address: 'Yaoundé, Cameroon',
    primary_color: '#FF6B35',
    description: 'TRU Group - Technology and Innovation Solutions'
  };

  try {
    for (const [key, value] of Object.entries(defaultSettings)) {
      const { data, error } = await supabase
        .from('settings')
        .upsert([{ key, value }], { onConflict: 'key' })
        .select();

      if (error) {
        console.error(`❌ Error setting ${key}:`, error.message);
      } else {
        console.log(`✅ ${key}: ${value}`);
      }
    }
    
    console.log('\n✅ All settings seeded successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

seedSettings();
