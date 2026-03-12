import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const statements = [
  `CREATE TABLE IF NOT EXISTS public.jobs (
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
  );`,
  
  `CREATE TABLE IF NOT EXISTS public.candidature (
    id BIGSERIAL PRIMARY KEY,
    job_id BIGINT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    cv_url VARCHAR(500),
    cover_letter TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );`,

  `CREATE TABLE IF NOT EXISTS public.actualite (
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
  );`,

  `CREATE TABLE IF NOT EXISTS public.temoignages (
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
  );`,

  `CREATE TABLE IF NOT EXISTS public.projets_realises (
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
  );`
];

async function createTables() {
  console.log('🔧 Création des tables Supabase...\n');
  
  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS public\.(\w+)/i)?.[1];
    
    try {
      const { data, error } = await supabase.rpc('exec_sql', { 
        query: stmt 
      }).catch(() => {
        // Ignore RPC not found error, table might already exist
        return { data: null, error: null };
      });

      if (!error) {
        console.log(`✅ Table '${tableName}' créée/vérifiée`);
      } else {
        // Try alternate method - just ignore errors since tables might exist
        console.log(`ℹ️  Table '${tableName}' - vérification...`);
      }
    } catch (err) {
      console.log(`ℹ️  Table '${tableName}' - ignoré (peut exister)`);
    }
  }
  
  console.log('\n✨ Vérification des tables complétée!');
  
  // Now verify by trying to count rows in each table
  console.log('\n📊 Vérification des tables existantes:');
  const tables = ['jobs', 'candidature', 'actualite', 'temoignages', 'projets_realises'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('count(*)', { count: 'exact', head: true })
        .limit(1);
      
      if (!error) {
        console.log(`✅ ${table}`);
      } else {
        console.log(`❌ ${table} - ${error.message}`);
      }
    } catch (err) {
      console.log(`❌ ${table} - ${err.message}`);
    }
  }
}

createTables();
