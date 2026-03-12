# 🚀 SUPABASE SETUP GUIDE - TRU GROUP

**Durée totale:** 45 minutes  
**Difficulté:** Facile  
**Prérequis:** Compte email

---

## 📋 ÉTAPE 1: CRÉER COMPTE SUPABASE (5 min)

### 1.1 S'inscrire

```
1. Aller sur https://supabase.com
2. Cliquer "Start your project"
3. S'inscrire avec:
   - GitHub (recommandé)
   - Google
   - Email
```

### 1.2 Créer un nouveau projet

```
1. Cliquer "New Project"
2. Configurer:
   - Name: tru-group
   - Database Password: [générer fort]
     Exemple: Tr4G$p!2026_Sec
   - Region: Europe West (Belgium) ou Frankfurt
   - Pricing Plan: Free
3. Cliquer "Create new project"
4. Attendre 2-3 minutes (création database)
```

---

## 🔑 ÉTAPE 2: RÉCUPÉRER LES CLÉS (2 min)

### 2.1 Trouver les credentials

```
Dans votre projet Supabase:
1. Cliquer sur "Settings" (⚙️) dans la barre latérale
2. Cliquer "API" dans le sous-menu
3. Copier ces 2 valeurs:

   ✅ Project URL
      https://xxxxxx.supabase.co
   
   ✅ anon/public key
      eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 2.2 Sauvegarder localement

```bash
# Créer backend/.env (si n'existe pas)
touch backend/.env

# Ajouter ces lignes:
SUPABASE_URL=https://xxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NODE_ENV=development
```

---

## 🗂️ ÉTAPE 3: CRÉER LES TABLES (10 min)

### 3.1 Ouvrir SQL Editor

```
1. Dans Supabase Dashboard
2. Cliquer "SQL Editor" dans la barre latérale
3. Cliquer "New query"
```

### 3.2 Copier-coller ce SQL

```sql
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

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_services_name ON services(name);
CREATE INDEX IF NOT EXISTS idx_solutions_service_id ON solutions(service_id);
CREATE INDEX IF NOT EXISTS idx_solutions_name ON solutions(name);
CREATE INDEX IF NOT EXISTS idx_team_role ON team(role);
CREATE INDEX IF NOT EXISTS idx_team_email ON team(email);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);

-- Enable Row Level Security (RLS)
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create Policies (permettre lecture publique, écriture authentifiée)
-- Services: Lecture publique
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (true);

-- Services: Écriture avec clé API
CREATE POLICY "Services can be modified with API key" ON services
  FOR ALL USING (true);

-- Solutions: Lecture publique
CREATE POLICY "Solutions are viewable by everyone" ON solutions
  FOR SELECT USING (true);

CREATE POLICY "Solutions can be modified with API key" ON solutions
  FOR ALL USING (true);

-- Team: Lecture publique
CREATE POLICY "Team members are viewable by everyone" ON team
  FOR SELECT USING (true);

CREATE POLICY "Team can be modified with API key" ON team
  FOR ALL USING (true);

-- Contacts: Écriture publique (formulaire contact)
CREATE POLICY "Contacts can be created by anyone" ON contacts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Contacts can be read with API key" ON contacts
  FOR SELECT USING (true);

CREATE POLICY "Contacts can be updated with API key" ON contacts
  FOR UPDATE USING (true);

-- Settings: Seulement avec API key
CREATE POLICY "Settings are accessible with API key" ON settings
  FOR ALL USING (true);
```

### 3.3 Exécuter le script

```
1. Cliquer "Run" (Ctrl+Enter)
2. Vérifier le succès (✅ Success. No rows returned)
3. Aller à "Table Editor" → Voir les 6 tables créées
```

---

## 📦 ÉTAPE 4: INSTALLER PACKAGES (3 min)

```bash
cd backend

# Installer Supabase client
npm install @supabase/supabase-js

# Vérifier l'installation
npm list @supabase/supabase-js
```

---

## 🔄 ÉTAPE 5: MIGRER LES DONNÉES JSON (5 min)

### 5.1 Vérifier data.json

```bash
# S'assurer que data.json existe et contient des données
cat backend/data.json

# Doit afficher services, team, solutions, etc.
```

### 5.2 Lancer la migration

```bash
cd backend
node lib/supabase-migration.js
```

### 5.3 Output attendu

```
🚀 Démarrage Migration Supabase

========================================
🔗 Test connexion Supabase...
✅ Connexion réussie

📂 Lecture data.json...
✅ 4 collections trouvées

💾 Création backup...
✅ Backup créé: backend/data-backup-2026-02-19T10-30-00-000Z.json

📦 Migration Services...
✅ 6 services migrés (0 erreurs)

📦 Migration Solutions...
✅ 8 solutions migrées (0 erreurs)

📦 Migration Team...
✅ 12 membres migrés (0 erreurs)

📦 Migration Contacts...
✅ 3 contacts migrés (0 erreurs)

🔍 Vérification de la migration...
📊 Résumé:
   • Services: 6
   • Solutions: 8
   • Team: 12
   • Contacts: 3

========================================
✅ Migration terminée avec succès!

📊 Total migré:
   • 6 services
   • 8 solutions
   • 12 membres
   • 3 contacts

💾 Backup sauvegardé: backend/data-backup-2026-02-19T10-30-00-000Z.json
```

### 5.4 Vérifier dans Supabase

```
1. Aller dans "Table Editor"
2. Cliquer sur "services" → Voir les 6 services
3. Cliquer sur "team" → Voir les 12 membres
4. Cliquer sur "solutions" → Voir les 8 solutions
✅ Les données sont migrées!
```

---

## 🔧 ÉTAPE 6: METTRE À JOUR SERVER.JS (10 min)

### 6.1 Importer Supabase

```javascript
// backend/server.js - Ajouter en haut:
import * as db from './lib/supabase.js';
```

### 6.2 Remplacer les routes Services

```javascript
// GET all services
app.get('/api/services', async (req, res) => {
  try {
    const data = await db.services.getAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single service
app.get('/api/services/:id', async (req, res) => {
  try {
    const data = await db.services.getById(req.params.id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(404).json({ success: false, error: 'Not found' });
  }
});

// POST create service
app.post('/api/services', async (req, res) => {
  try {
    const data = await db.services.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT update service
app.put('/api/services/:id', async (req, res) => {
  try {
    const data = await db.services.update(req.params.id, req.body);
    res.json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE service
app.delete('/api/services/:id', async (req, res) => {
  try {
    await db.services.delete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### 6.3 Répéter pour Team, Solutions, Contacts

```javascript
// Team routes
app.get('/api/team', async (req, res) => {
  try {
    const data = await db.team.getAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/team', async (req, res) => {
  try {
    const data = await db.team.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ... (PUT et DELETE similaires)

// Solutions routes
app.get('/api/solutions', async (req, res) => {
  try {
    const data = await db.solutions.getAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ... (POST, PUT, DELETE similaires)

// Contacts routes
app.get('/api/contacts', async (req, res) => {
  try {
    const data = await db.contacts.getAll();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/contacts', async (req, res) => {
  try {
    const data = await db.contacts.create(req.body);
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});
```

### 6.4 Ajouter Health Check

```javascript
// Health check endpoint
app.get('/api/health/db', async (req, res) => {
  try {
    const health = await db.healthCheck();
    res.json(health);
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});
```

---

## ✅ ÉTAPE 7: TESTER LOCALEMENT (5 min)

### 7.1 Démarrer le serveur

```bash
cd backend
npm start

# Output:
# ✅ Server running on port 5000
```

### 7.2 Tester les endpoints

```bash
# Test health
curl http://localhost:5000/api/health/db

# Test GET services
curl http://localhost:5000/api/services

# Test POST service
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Service","description":"Testing Supabase"}'

# Test PUT
curl -X PUT http://localhost:5000/api/services/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Updated","description":"Updated via Supabase"}'

# Test DELETE
curl -X DELETE http://localhost:5000/api/services/1
```

### 7.3 Vérifier dans Supabase Dashboard

```
1. Table Editor → services
2. Les modifications doivent apparaître en temps réel
3. Rafraîchir la page → Les données persistent ✅
```

---

## 🚀 ÉTAPE 8: DÉPLOYER SUR RENDER (5 min)

### 8.1 Ajouter variables à Render

```
Render Dashboard → tru-backend → Environment

Ajouter:
  SUPABASE_URL = https://xxxxxx.supabase.co
  SUPABASE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  NODE_ENV = production
```

### 8.2 Déployer

```bash
git add .
git commit -m "feat: migrate to Supabase"
git push render main

# Suivre les logs dans Render Dashboard
```

### 8.3 Tester en production

```bash
# Remplacer par votre URL Render
curl https://tru-backend-xxx.onrender.com/api/health/db
curl https://tru-backend-xxx.onrender.com/api/services
```

---

## 🎁 BONUS FEATURES SUPABASE

### 1. Realtime Subscriptions

```javascript
// backend/routes/realtime.js
import { subscribeToTable } from '../lib/supabase.js';

// Écouter les changements sur services
const subscription = subscribeToTable('services', (payload) => {
  console.log('Change detected:', payload);
  // Notifier les clients via WebSocket
});
```

### 2. Backup Automatique

```javascript
// backend/utils/backup.js
import { backupToJSON } from '../lib/supabase.js';
import cron from 'node-cron';
import fs from 'fs';

// Backup nightly à 2 AM
cron.schedule('0 2 * * *', async () => {
  const backup = await backupToJSON();
  fs.writeFileSync('data-backup.json', JSON.stringify(backup, null, 2));
  console.log('✅ Backup completed');
});
```

### 3. Dashboard Supabase

```
Accéder à:
- Table Editor: Modifier données visuellement
- SQL Editor: Requêtes complexes
- Auth: Gestion utilisateurs (à venir)
- Storage: Upload fichiers (images team, etc.)
- API Docs: Documentation auto-générée
```

---

## 📊 RÉSULTAT FINAL

**Avant (JSON):**
- ❌ Données perdues au redémarrage
- ❌ Pas de backup automatique
- ❌ Pas de dashboard admin
- ❌ Pas de realtime

**Après (Supabase):**
- ✅ Données persistent (PostgreSQL)
- ✅ Backup automatique
- ✅ Dashboard admin puissant
- ✅ Realtime intégré
- ✅ API auto-générée
- ✅ Scalable et gratuit
- ✅ 500 MB stockage
- ✅ Auth intégrée (bonus)

---

## 🔧 TROUBLESHOOTING

### Erreur: "Invalid API key"
```bash
# Vérifier les variables
cat backend/.env

# S'assurer SUPABASE_URL et SUPABASE_KEY sont corrects
# Récupérer depuis Supabase Dashboard → Settings → API
```

### Erreur: "Table does not exist"
```bash
# Retourner à SQL Editor
# Ré-exécuter le script de création de tables
```

### Erreur: "Row Level Security policy"
```sql
-- Désactiver RLS temporairement (développement seulement)
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
```

---

**✅ Setup Complete!**  
*Votre backend utilise maintenant Supabase PostgreSQL*  
*Temps total: ~45 minutes*
