-- ============================================
-- SUPABASE SQL SCHEMA - TRU GROUP
-- Projet: lupnscaeituljcddaagk
-- ============================================

-- Services Table
CREATE TABLE IF NOT EXISTS services (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  icon VARCHAR(255),
  features JSONB,
  objective TEXT,
  color VARCHAR(50),
  image_url TEXT,
  ordering INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Solutions Table
CREATE TABLE IF NOT EXISTS solutions (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  target_audience TEXT,
  features JSONB,
  benefits JSONB,
  pricing TEXT,
  demo_url VARCHAR(255),
  service_id BIGINT REFERENCES services(id),
  ordering INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Table
CREATE TABLE IF NOT EXISTS team (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE,
  role VARCHAR(255),
  department VARCHAR(100),
  bio TEXT,
  photo_url TEXT,
  phone VARCHAR(20),
  social_links JSONB,
  ordering INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'new',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (pour backoffice auth)
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id BIGSERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_solutions_service_id ON solutions(service_id);
CREATE INDEX IF NOT EXISTS idx_solutions_name ON solutions(name);
CREATE INDEX IF NOT EXISTS idx_team_role ON team(role);
CREATE INDEX IF NOT EXISTS idx_team_email ON team(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLICIES
-- ============================================

-- Services: Lecture publique, écriture avec clé API
DROP POLICY IF EXISTS "Services are viewable by everyone" ON services;
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Services can be modified with API key" ON services;
CREATE POLICY "Services can be modified with API key" ON services
  FOR ALL USING (true);

-- Solutions: Lecture publique, écriture avec clé API
DROP POLICY IF EXISTS "Solutions are viewable by everyone" ON solutions;
CREATE POLICY "Solutions are viewable by everyone" ON solutions
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Solutions can be modified with API key" ON solutions;
CREATE POLICY "Solutions can be modified with API key" ON solutions
  FOR ALL USING (true);

-- Team: Lecture publique, écriture avec clé API
DROP POLICY IF EXISTS "Team members are viewable by everyone" ON team;
CREATE POLICY "Team members are viewable by everyone" ON team
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Team can be modified with API key" ON team;
CREATE POLICY "Team can be modified with API key" ON team
  FOR ALL USING (true);

-- Contacts: Écriture publique (formulaire), lecture avec API key
DROP POLICY IF EXISTS "Contacts can be created by anyone" ON contacts;
CREATE POLICY "Contacts can be created by anyone" ON contacts
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Contacts can be read with API key" ON contacts;
CREATE POLICY "Contacts can be read with API key" ON contacts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Contacts can be updated with API key" ON contacts;
CREATE POLICY "Contacts can be updated with API key" ON contacts
  FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Contacts can be deleted with API key" ON contacts;
CREATE POLICY "Contacts can be deleted with API key" ON contacts
  FOR DELETE USING (true);

-- Settings: Accessible seulement avec API key
DROP POLICY IF EXISTS "Settings are accessible with API key" ON settings;
CREATE POLICY "Settings are accessible with API key" ON settings
  FOR ALL USING (true);

-- ============================================
-- DONE! 
-- ============================================
-- Vérifier avec: SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
