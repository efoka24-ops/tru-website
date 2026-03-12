-- ============================================
-- FIX PERMISSIONS SUPABASE - FORMATIONS
-- ============================================
-- Ce fichier désactive RLS pour les tables formations
-- À EXÉCUTER dans Supabase SQL Editor

-- Désactiver RLS (Row Level Security) sur les tables formations
-- Cela permet au backend d'accéder librement aux données
ALTER TABLE formations DISABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions_formations DISABLE ROW LEVEL SECURITY;

-- ============================================
-- ALTERNATIVE: Si vous voulez GARDER RLS activé
-- ============================================
-- Décommentez les lignes suivantes pour créer des politiques
-- qui permettent TOUTES les opérations (plus sécurisé)

/*
-- Activer RLS
ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inscriptions_formations ENABLE ROW LEVEL SECURITY;

-- Politique 1: Autoriser lecture publique des formations
CREATE POLICY "Lecture publique formations" 
ON formations FOR SELECT 
USING (true);

-- Politique 2: Autoriser toutes opérations pour utilisateurs authentifiés
CREATE POLICY "Admin formations" 
ON formations FOR ALL 
USING (auth.role() = 'authenticated');

-- Politique 3: Autoriser lecture des inscriptions pour admins
CREATE POLICY "Lecture inscriptions admin" 
ON inscriptions_formations FOR SELECT 
USING (auth.role() = 'authenticated');

-- Politique 4: Autoriser création d'inscriptions publiquement
CREATE POLICY "Création inscriptions publique" 
ON inscriptions_formations FOR INSERT 
WITH CHECK (true);

-- Politique 5: Autoriser modifications pour admins
CREATE POLICY "Modification inscriptions admin" 
ON inscriptions_formations FOR UPDATE 
USING (auth.role() = 'authenticated');

-- Politique 6: Autoriser suppressions pour admins
CREATE POLICY "Suppression inscriptions admin" 
ON inscriptions_formations FOR DELETE 
USING (auth.role() = 'authenticated');
*/

-- ============================================
-- RÉSUMÉ
-- ============================================
-- ✅ RLS désactivé sur 'formations'
-- ✅ RLS désactivé sur 'inscriptions_formations'
-- 
-- Maintenant le backend peut lire/écrire librement
-- ============================================
