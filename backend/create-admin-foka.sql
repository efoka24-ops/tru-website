-- Créer le compte admin pour adminfoka@trugroup.com
-- Password: Admin@TRU2026!

INSERT INTO users (email, password_hash, name, role, active) 
VALUES (
    'adminfoka@trugroup.com', 
    '$2b$10$l5G3E4a6iiuTOVapY8mKeOrGMgVABkE5A6I.scXpNmOXSYGw1awB6', 
    'Admin Foka', 
    'admin', 
    true
);

-- Pour vérifier que l'utilisateur a été créé :
-- SELECT * FROM users WHERE email = 'adminfoka@trugroup.com';
