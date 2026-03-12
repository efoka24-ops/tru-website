import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function createAllTables() {
  try {
    console.log('🔍 Vérification et création des tables Supabase...\n');

    // Liste des statements SQL pour créer les tables
    const sqlStatements = [
      {
        name: 'jobs',
        sql: `
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
        `
      },
      {
        name: 'candidature',
        sql: `
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
        `
      },
      {
        name: 'actualite',
        sql: `
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
        `
      },
      {
        name: 'temoignages',
        sql: `
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
        `
      },
      {
        name: 'projets_realises',
        sql: `
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
        `
      }
    ];

    // Essayer de créer les tables une par une
    for (const statement of sqlStatements) {
      try {
        // Vérifier si la table existe d'abord
        const { data, error: checkError } = await supabase
          .from(statement.name)
          .select('count(*)', { count: 'exact', head: true })
          .limit(1);

        if (!checkError) {
          console.log(`✅ Table '${statement.name}' existe déjà`);
        } else if (checkError.code === 'PGRST116') {
          // Table n'existe pas, essayer de la créer
          console.log(`📋 Table '${statement.name}' n'existe pas, création...`);
          
          // Impossible de créer via l'API, afficher les instructions
          console.log(`⚠️  Merci de créer la table '${statement.name}' manuellement dans Supabase SQL Editor :`);
          console.log(statement.sql);
          console.log('---\n');
        }
      } catch (error) {
        console.log(`⚠️  Erreur pour '${statement.name}':`, error.message);
      }
    }

    console.log('✨ Veuillez exécuter les statements SQL ci-dessus dans l\'éditeur SQL Supabase');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

createAllTables();
