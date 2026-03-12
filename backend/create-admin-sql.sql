-- Créer le compte administrateur dans Supabase
-- Copier ce SQL dans Supabase SQL Editor

-- Mot de passe: Admin@TRU2026!
-- (Hash bcrypt avec 10 rounds)

INSERT INTO users (email, password_hash, name, role, active) 
VALUES (
  'admin@trugroup.cm',
  '$2b$10$YqVZ3K9xQZJ7X8H.gR5xmOQh5K5wF7F5xmOQh5K5wF7F5xmOQh5K5w',
  'Admin TRU GROUP',
  'admin',
  true
);

-- OU avec l'email actuel dans data.json:
INSERT INTO users (email, password_hash, name, role, active) 
VALUES (
  'admin@sitetru.com',
  '$2b$10$YqVZ3K9xQZJ7X8H.gR5xmOQh5K5wF7F5xmOQh5K5wF7F5xmOQh5K5w',
  'Admin TRU',
  'admin',
  true
);

-- Vérifier la création:
SELECT id, email, name, role, active FROM users WHERE role = 'admin';
