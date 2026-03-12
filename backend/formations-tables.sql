-- ============================================
-- TABLES SYSTÈME DE FORMATIONS - TRU GROUP
-- ============================================

-- Table: formations
CREATE TABLE IF NOT EXISTS formations (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(255) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  duree VARCHAR(100) NOT NULL,
  format VARCHAR(50) NOT NULL, -- 'presentiel', 'en_ligne', 'hybride'
  lieu VARCHAR(255),
  modules JSONB, -- Liste des modules en JSON
  image_url TEXT,
  places_disponibles INTEGER DEFAULT 20,
  statut VARCHAR(50) DEFAULT 'active', -- 'active', 'terminee', 'annulee'
  date_debut DATE,
  date_fin DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table: inscriptions_formations
CREATE TABLE IF NOT EXISTS inscriptions_formations (
  id SERIAL PRIMARY KEY,
  formation_id INTEGER REFERENCES formations(id) ON DELETE CASCADE,
  numero_inscription VARCHAR(50) UNIQUE NOT NULL,
  nom VARCHAR(255) NOT NULL,
  prenom VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telephone VARCHAR(50) NOT NULL,
  profession VARCHAR(255),
  entreprise VARCHAR(255),
  statut VARCHAR(50) DEFAULT 'en_attente', -- 'en_attente', 'confirmee', 'annulee'
  fiche_telechargee_le TIMESTAMP WITH TIME ZONE,
  paiement_confirme_le TIMESTAMP WITH TIME ZONE,
  montant_paye DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_inscriptions_numero ON inscriptions_formations(numero_inscription);
CREATE INDEX IF NOT EXISTS idx_inscriptions_email ON inscriptions_formations(email);
CREATE INDEX IF NOT EXISTS idx_formations_statut ON formations(statut);

-- Fonction pour générer numéro d'inscription unique
CREATE OR REPLACE FUNCTION generer_numero_inscription()
RETURNS TEXT AS $$
DECLARE
  annee TEXT;
  compteur INTEGER;
  numero TEXT;
BEGIN
  annee := TO_CHAR(NOW(), 'YYYY');
  
  -- Compter les inscriptions de cette année
  SELECT COUNT(*) + 1 INTO compteur
  FROM inscriptions_formations
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  -- Format: FORM-2026-0001
  numero := 'FORM-' || annee || '-' || LPAD(compteur::TEXT, 4, '0');
  
  RETURN numero;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour auto-générer le numéro avant insertion
CREATE OR REPLACE FUNCTION set_numero_inscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.numero_inscription IS NULL OR NEW.numero_inscription = '' THEN
    NEW.numero_inscription := generer_numero_inscription();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_numero_inscription
BEFORE INSERT ON inscriptions_formations
FOR EACH ROW
EXECUTE FUNCTION set_numero_inscription();

-- Données de test (formations exemple)
INSERT INTO formations (titre, description, prix, duree, format, lieu, modules, places_disponibles, date_debut, date_fin) VALUES
('Formation DevOps & CI/CD', 'Maîtrisez les outils et pratiques DevOps pour automatiser vos déploiements', 350000, '2 semaines', 'presentiel', 'Yaoundé, Cameroun', 
'["Introduction DevOps", "Git & GitHub", "Docker & Containers", "CI/CD avec Jenkins", "Kubernetes", "Monitoring & Logging"]',
15, '2026-03-15', '2026-03-29'),

('Développement Web Full Stack', 'Devenez développeur Full Stack avec React, Node.js et MongoDB', 500000, '1 mois', 'en_ligne', 'Formation en ligne',
'["HTML/CSS/JavaScript", "React.js", "Node.js & Express", "MongoDB", "API REST", "Déploiement"]',
30, '2026-04-01', '2026-04-30'),

('Data Science & Machine Learning', 'Analysez les données et créez des modèles d''IA', 650000, '6 semaines', 'hybride', 'Douala / En ligne',
'["Python pour Data Science", "Pandas & NumPy", "Visualisation", "Machine Learning", "Deep Learning", "Projet final"]',
20, '2026-05-01', '2026-06-15');

-- Commentaires sur les tables
COMMENT ON TABLE formations IS 'Liste des formations proposées par TRU GROUP';
COMMENT ON TABLE inscriptions_formations IS 'Inscriptions aux formations avec numéros uniques';
COMMENT ON COLUMN inscriptions_formations.numero_inscription IS 'Numéro unique au format FORM-YYYY-0001';
COMMENT ON COLUMN formations.modules IS 'Liste des modules en JSON array';
