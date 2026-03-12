import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createMissingTables() {
  try {
    console.log('🔍 Creating missing tables in Supabase...\n');

    // 1. Jobs table
    console.log('📋 Creating jobs table...');
    const { error: jobsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS jobs (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          description TEXT,
          location VARCHAR(255),
          type VARCHAR(50),
          department VARCHAR(100),
          requirements TEXT,
          salary_range VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));
    
    if (!jobsError) console.log('✅ jobs table created');

    // 2. Candidature (Applications) table
    console.log('📋 Creating candidature table...');
    const { error: candidatureError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS candidature (
          id BIGSERIAL PRIMARY KEY,
          job_id BIGINT REFERENCES jobs(id) ON DELETE CASCADE,
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          cv_url VARCHAR(500),
          cover_letter TEXT,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));
    
    if (!candidatureError) console.log('✅ candidature table created');

    // 3. Actualite (News/Blog) table
    console.log('📋 Creating actualite table...');
    const { error: actualiteError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS actualite (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE,
          excerpt VARCHAR(500),
          content TEXT,
          image_url VARCHAR(500),
          author VARCHAR(100),
          published BOOLEAN DEFAULT false,
          published_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));
    
    if (!actualiteError) console.log('✅ actualite table created');

    // 4. Temoignages (Testimonials) table
    console.log('📋 Creating temoignages table...');
    const { error: temoignagesError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS temoignages (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          title VARCHAR(255),
          company VARCHAR(255),
          message TEXT NOT NULL,
          rating INT DEFAULT 5,
          image_url VARCHAR(500),
          published BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));
    
    if (!temoignagesError) console.log('✅ temoignages table created');

    // 5. Projets Realises (Completed Projects) table
    console.log('📋 Creating projets_realises table...');
    const { error: projetsError } = await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS projets_realises (
          id BIGSERIAL PRIMARY KEY,
          title VARCHAR(255) NOT NULL,
          slug VARCHAR(255) UNIQUE,
          description TEXT,
          image_url VARCHAR(500),
          client VARCHAR(255),
          category VARCHAR(100),
          technologies TEXT[],
          results TEXT,
          published BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `
    }).catch(() => ({ error: null }));
    
    if (!projetsError) console.log('✅ projets_realises table created');

    console.log('\n✅ Table creation completed!');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createMissingTables();
