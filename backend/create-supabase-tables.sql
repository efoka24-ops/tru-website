-- Supabase SQL Script pour créer les tables manquantes
-- Copier-coller tout le script dans l'SQL Editor de Supabase

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

-- Activer RLS si nécessaire
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidature ENABLE ROW LEVEL SECURITY;
ALTER TABLE actualite ENABLE ROW LEVEL SECURITY;
ALTER TABLE temoignages ENABLE ROW LEVEL SECURITY;
ALTER TABLE projets_realises ENABLE ROW LEVEL SECURITY;

-- Créer les politiques publiques (lectures publiques, écritures protégées)
CREATE POLICY "Jobs are publicly readable" ON jobs FOR SELECT USING (true);
CREATE POLICY "Candidatures are publicly readable" ON candidature FOR SELECT USING (true);
CREATE POLICY "Actualites are publicly readable" ON actualite FOR SELECT USING (published = true);
CREATE POLICY "Temoignages are publicly readable" ON temoignages FOR SELECT USING (published = true);
CREATE POLICY "Projets are publicly readable" ON projets_realises FOR SELECT USING (published = true);
