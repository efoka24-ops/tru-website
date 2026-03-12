#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const sqlScript = `
-- 1. Table jobs (Offres d'emploi)
CREATE TABLE IF NOT EXISTS public.jobs (
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

-- 2. Table candidature (Candidatures/Applications)
CREATE TABLE IF NOT EXISTS public.candidature (
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 3. Table actualite (Actualités/News)
CREATE TABLE IF NOT EXISTS public.actualite (
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

-- 4. Table temoignages (Témoignages/Testimonials)
CREATE TABLE IF NOT EXISTS public.temoignages (
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

-- 5. Table projets_realises (Projets réalisés/Completed Projects)
CREATE TABLE IF NOT EXISTS public.projets_realises (
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
`;

async function executeSql() {
  console.log('🔧 Exécution du script SQL Supabase...\n');

  // Split by statement
  const statements = sqlScript
    .split(';')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('--'));

  console.log(`📊 ${statements.length} statements à exécuter\n`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i] + ';';
    const tableName = stmt.match(/CREATE TABLE.*?public\.(\w+)/i)?.[1] || `statement ${i+1}`;
    
    try {
      // Check if table already exists first
      if (tableName !== 'statement') {
        const { error: checkError } = await supabase
          .from(tableName)
          .select('count', { count: 'exact', head: true })
          .limit(1);
        
        if (!checkError) {
          console.log(`✅ Table '${tableName}' existe déjà`);
          continue;
        }
      }

      // Need to use postgres API directly, but client doesn't have that
      // So we'll just check if table exists
      console.log(`⚠️  Table '${tableName}' - créer manuellement dans Supabase SQL Editor`);
    } catch (err) {
      console.log(`ℹ️  Table '${tableName}' - ${err.message}`);
    }
  }

  console.log('\n📝 Les tables suivantes doivent être créées:');
  console.log('   - jobs');
  console.log('   - candidature');
  console.log('   - actualite');
  console.log('   - temoignages');
  console.log('   - projets_realises');
  
  console.log('\n📌 Instructions:');
  console.log('   1. Allez sur https://app.supabase.com');
  console.log('   2. Ouvrez votre projet');
  console.log('   3. Allez dans SQL Editor');
  console.log('   4. Créez une nouvelle query');
  console.log('   5. Copier-colle le contenu de create-supabase-tables.sql');
  console.log('   6. Cliquez sur "Run"');
  
  console.log('\n✨ Après création des tables, les endpoints seront disponibles:');
  console.log('   - GET/POST /api/jobs');
  console.log('   - GET/POST /api/applications (candidature)');
  console.log('   - GET/POST /api/news (actualite)');
  console.log('   - GET/POST /api/testimonials (temoignages)');
  console.log('   - GET/POST /api/projets-realises');
}

executeSql();
