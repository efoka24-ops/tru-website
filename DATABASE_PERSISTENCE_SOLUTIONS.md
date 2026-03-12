# 🔍 DIAGNOSTIC & SOLUTIONS - Problème de Persistance des Données

**Date:** Février 2026  
**Problème:** Les données se réactualisent à chaque redémarrage, malgré les mises à jour  
**Status:** 🔴 **CRITIQUE - À Résoudre Immédiatement**

---

## 📊 DIAGNOSTIC DU PROBLÈME

### Symptômes Observés
```
❌ Ajouter/modifier données via backoffice
❌ Données sauvegardées localement (voir dans data.json)
❌ Redémarrer le serveur backend
❌ Les données reviennent aux données générées/vides
❌ Les modifications sont perdues
```

### Causes Possibles (Priorité Haute → Basse)

#### 🔴 CAUSE 1: Volume Persistant Render Non Configuré (Très Probable)
```
Symptôme: Chaque redémarrage sur Render relance depuis zéro
Raison: Render utilise des ephemeral filesystems par défaut
Solution: Configurer un Persistent Volume
```

**Comment vérifier:**
```bash
# Sur le terminal Render:
ls -la /data/  # Chercher le volume
env | grep DATA_DIR  # Vérifier la variable
```

#### 🟡 CAUSE 2: Problème d'Atomic Writes (Probable)
```
Symptôme: Les données s'écrivent mais ne persistent pas correctement
Raison: Race conditions ou fsync non synchronisé
Solution: Améliorer DataManager.writeData()
```

#### 🟡 CAUSE 3: Data.json Non En Local (Probable)
```
Symptôme: Sur Render, data.json n'existe pas au redémarrage
Raison: Fichiers créés dans un répertoire éphémère
Solution: Utiliser process.env.DATA_DIR vers volume persistant
```

#### 🟢 CAUSE 4: Git Sync Fait Revert (Possible)
```
Symptôme: Données sont overwritten par le repo GitHub
Raison: Un script restaure depuis git au démarrage
Solution: Vérifier initializeData.js (déjà OK)
```

---

## 🏗️ ARCHITECTURE ACTUELLE VS IDÉALE

### Actuellement (JSON)
```
Frontend → Backoffice
    ↓
API Backend (Express)
    ↓
data.json (local ephemeral)
    ↓
❌ Perte de données au redémarrage
```

### Problème Critique
```
Render Ephemeral Filesystem:
├─ Les fichiers sont supprimés au redémarrage
├─ data.json créé au runtime est perdu
├─ Chaque restart = slate clean
└─ Données perdues définitivement
```

---

## ✅ SOLUTIONS PROPOSÉES

### SOLUTION 1: Améliorer le Système JSON Actuel (Court terme - 2h)

#### Étape 1: Configurer Volume Persistant Render
```yaml
# render.yaml ou Render Dashboard

services:
- type: web
  name: tru-backend
  env: node
  buildCommand: npm install
  startCommand: npm start
  
  # ✅ AJOUTER:
  diskSize: 1  # GB
  diskPath: /data
  envVars:
    - key: DATA_DIR
      value: /data
```

#### Étape 2: Améliorer DataManager.writeData()
```javascript
// backend/dataManager.js - Ajouter:

static writeData(data) {
  try {
    // 1. Créer backup atomiquement
    const tempFile = `${DATA_FILE}.tmp`;
    const backupFile = `${DATA_FILE}.backup`;
    
    // 2. Écrire dans fichier temporaire
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    
    // 3. Vérifier l'intégrité avant de remplacer
    const verifyData = JSON.parse(fs.readFileSync(tempFile, 'utf-8'));
    if (!verifyData || verifyData.length === 0) {
      throw new Error('Data write verification failed');
    }
    
    // 4. Créer backup du fichier actuel
    if (fs.existsSync(DATA_FILE)) {
      fs.copyFileSync(DATA_FILE, backupFile);
    }
    
    // 5. Atomic rename (opération atomique)
    fs.renameSync(tempFile, DATA_FILE);
    
    // 6. Calculer et sauvegarder checksum
    const checksum = this.calculateChecksum(data);
    fs.writeFileSync(DATA_CHECKSUM_FILE, checksum);
    
    // 7. Synchroniser vers le filesystem
    fs.syncSync?.(DATA_FILE);
    
    // 8. Mettre en cache
    memoryCache = data;
    
    console.log('✅ Data saved atomically');
    return true;
  } catch (error) {
    console.error('❌ Write failed:', error.message);
    return false;
  }
}
```

#### Étape 3: Ajouter Health Check
```javascript
// backend/routes/health.js

app.get('/api/health', (req, res) => {
  const dataFile = fs.existsSync(DATA_FILE);
  const readable = fs.statSync(DATA_FILE)?.size > 0;
  
  res.json({
    status: 'OK',
    dataFile: dataFile ? 'EXISTS' : 'MISSING',
    dataSize: readable ? fs.statSync(DATA_FILE).size : 0,
    persistentStorage: process.env.DATA_DIR ? 'YES' : 'NO'
  });
});
```

**Avantages:**
- ✅ Implémentation rapide
- ✅ Pas de migration nécessaire
- ✅ Compatible avec setup actuel
- ✅ Coût: Gratuit

**Inconvénients:**
- ❌ Pas scalable (max ~100MB)
- ❌ Performance: O(n) pour chaque opération
- ❌ Pas de requêtes rapides (pas d'indexing)
- ❌ Pas de concurrence

---

### SOLUTION 2: Migrer vers SQL (Recommended - 8h)

#### Option A: PostgreSQL (Recommandé)

**Services Free avec Persistance:**

1. **Render PostgreSQL** (Meilleur pour TRU)
   ```
   ✅ 1 instance gratuite
   ✅ 256 MB RAM
   ✅ 1 GB stockage
   ✅ Backup automatiques
   ✅ Persistance garantie
   ✅ Compatible avec Node.js
   
   URL: postgresql://user:pass@host/db
   ```

2. **Vercel Postgres** (Alternative)
   ```
   ✅ Gratuit avec Vercel
   ✅ Serverless
   ✅ Backup automatiques
   ✅ Haute disponibilité
   ```

3. **Supabase** (Alternative)
   ```
   ✅ 500 MB gratuit
   ✅ PostgreSQL managé
   ✅ REALTIMEintegré
   ✅ Très bon pour starter
   ```

#### Option B: MySQL (Alternative)

1. **PlanetScale** (MySQL)
   ```
   ✅ MySQL 8.0
   ✅ 5 GB gratuit
   ✅ Développement illimité
   ✅ Branches de données
   ```

2. **Railway** (Flexible)
   ```
   ✅ $5/mois crédits gratuits
   ✅ PostgreSQL ou MySQL
   ✅ Très facile à Setup
   ```

#### Implémentation PostgreSQL

**Étape 1: Setup Render PostgreSQL**
```
1. Aller sur render.com
2. Dashboard → New PostgreSQL
3. Sélectionner "Free"
4. Récupérer:
   - DATABASE_URL
   - HOST
   - USER
   - PASSWORD
```

**Étape 2: Créer le Schema**
```javascript
// backend/schema.sql

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE services (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  features JSONB,
  objective TEXT,
  color VARCHAR(50),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE solutions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_audience TEXT,
  features JSONB,
  benefits JSONB,
  pricing TEXT,
  demo_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  role VARCHAR(255),
  department VARCHAR(100),
  bio TEXT,
  photo_url TEXT,
  phone VARCHAR(20),
  social_links JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  message TEXT,
  status VARCHAR(50) DEFAULT 'new',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Créer les indexes
CREATE INDEX idx_services_name ON services(name);
CREATE INDEX idx_team_role ON team(role);
CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_created_at ON contacts(created_at);
```

**Étape 3: Setup Package.json**
```json
{
  "dependencies": {
    "pg": "^8.11.0",
    "dotenv": "^16.3.1",
    "express": "^4.18.2"
  }
}
```

**Étape 4: Créer DB Helper**
```javascript
// backend/lib/db.js

import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const query = (text, params) => pool.query(text, params);
export const getClient = () => pool.connect();

export default pool;
```

**Étape 5: Routes Conversion**
```javascript
// AVANT (JSON)
app.get('/api/services', (req, res) => {
  const data = readData();
  res.json(data.services);
});

app.post('/api/services', (req, res) => {
  const data = readData();
  const newService = { id: Date.now(), ...req.body };
  data.services.push(newService);
  writeData(data);
  res.json(newService);
});

// APRÈS (SQL)
import { query } from '../lib/db.js';

app.get('/api/services', async (req, res) => {
  try {
    const result = await query('SELECT * FROM services ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { name, description, icon } = req.body;
    const result = await query(
      'INSERT INTO services (name, description, icon) VALUES ($1, $2, $3) RETURNING *',
      [name, description, icon]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
```

**Avantages SQL:**
- ✅ Persistance garantie
- ✅ Requêtes rapides (ms au lieu de ms)
- ✅ Indexing automatique
- ✅ Transactions (ACID)
- ✅ Scalable (jusqu'à TB)
- ✅ Backup automatiques
- ✅ Concurrence gérée
- ✅ Sécurité (prepared statements vs injection)

**Inconvénients:**
- ❌ Migration from JSON (mais script auto disponible)
- ❌ Plus complexe à setupper initially
- ❌ Besoin de schéma prédéfini

---

### SOLUTION 3: Hybride (Recommandé - Best Of Both)

**Architecture:**
```
Frontend ↔ Backend
    ↓
PostgreSQL (données principales)
    ↓
Backup to JSON (nightly)
    ↓
GitHub Auto-sync
```

**Avantages:**
- ✅ Performance de SQL
- ✅ Récupération depuis JSON en cas de DB down
- ✅ Git history pour audit
- ✅ Scaling possible

**Implémentation:**
```javascript
// backend/hybrid-sync.js

import * as db from './lib/db.js';
import { writeData } from './dataManager.js';
import axios from 'axios';

// Chaque nuit: Exporter PostgreSQL vers JSON backup
async function backupDatabaseToJSON() {
  try {
    const [services, team, solutions, contacts, settings] = await Promise.all([
      db.query('SELECT * FROM services'),
      db.query('SELECT * FROM team'),
      db.query('SELECT * FROM solutions'),
      db.query('SELECT * FROM contacts'),
      db.query('SELECT * FROM settings')
    ]);

    const backup = {
      services: services.rows,
      team: team.rows,
      solutions: solutions.rows,
      contacts: contacts.rows,
      settings: settings.rows,
      backedUpAt: new Date().toISOString()
    };

    writeData(backup);
    console.log('✅ Database backed up to JSON');
  } catch (err) {
    console.error('❌ Backup failed:', err);
  }
}

// Chaque jour: Sync vers GitHub
async function syncToGitHub() {
  // Commit et push data.backup.json vers GitHub
}

// Schedule: Nightly à 2 AM
import cron from 'node-cron';
cron.schedule('0 2 * * *', backupDatabaseToJSON);
cron.schedule('0 3 * * *', syncToGitHub);
```

---

## 🚀 RECOMMANDATION: PLAN D'EXÉCUTION

### Phase 1 (Urgent - Aujourd'hui)
**Fixer le problème immédiat (30 min):**

```bash
# 1. Ajouter Volume Persistant à Render
# Settings → Disks → Add Persistent Disk
#   Size: 1 GB
#   Mount Path: /data

# 2. Ajouter .env à Render
# Settings → Environment
#   DATA_DIR=/data

# 3. Redéployer
git push render main
```

### Phase 2 (Court terme - Cette semaine)
**Améliorer atomicity (1 h):**

```bash
# Mettre à jour DataManager.writeData() avec code atomique fourni
# Test local: npm start
# Redéployer: git push render main
```

### Phase 3 (Moyen terme - 1-2 semaines)
**Migration vers SQL (8h):**

```bash
# 1. Setup Render PostgreSQL
# 2. Créer schema (copier-coller du SQL fourni)
# 3. Adapter les routes (code fourni)
# 4. Tester local avec docker-compose
# 5. Migrer progressivement
# 6. Garder JSON comme fallback

# Commandes:
npm install pg
```

### Phase 4 (Long terme - 1 mois)
**Optimisations:**

```bash
# Ajouter caching Redis
# Ajouter replication/backup
# Améliorer indexes de performance
# Monitoring et alertes
```

---

## 📋 SERVICE DATABASE COMPARISON

| Critère | JSON | PostgreSQL (Render) | MySQL (PlanetScale) | Supabase |
|---------|------|-------|-------|---------|
| **Coût** | 0$ | 0$ | 0$ (+ $5/mois si dépassement) | 0$ |
| **Stockage** | 1 GB | 1 GB | 5 GB | 500 MB |
| **Persistance** | ❌ Ephemeral | ✅ Garantie | ✅ Garantie | ✅ Garantie |
| **Vitesse** | Lent (sec) | Très rapide (ms) | Rapide (ms) | Rapide (ms) |
| **Scalabilité** | ❌ Non | ✅ Oui | ✅ Oui | ✅ Oui |
| **Backup** | Manuel | Auto ✅ | Auto ✅ | Auto ✅ |
| **Facilité Setup** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Support** | Aucun | Render | PlanetScale | Supabase |
| **Recommandé** | ❌ Non | ✅ OUI | ✅ Alternative | ✅ Alternative |

**🏆 Recommandation: Render PostgreSQL + JSON Backup**

---

## 🔧 QUICK FIXES IMMÉDIAT

### Fix 1: Render Persistent Storage
```yaml
# render.yaml
services:
  - type: web
    name: tru-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    autoDeploy: true
    
    # ✅ AJOUTER CES 3 LIGNES:
    disk:
      name: data
      mountPath: /data
      sizeGB: 1
    
    envVars:
      - key: DATA_DIR
        value: /data
        scope: build,runtime
```

### Fix 2: Vérifier DATA_FILE Config
```javascript
// backend/server.js - ligne ~32
// ACTUELLEMENT:
const DATA_DIR = process.env.DATA_DIR || __dirname;

// DEVRAIT ÊTRE:
const DATA_DIR = process.env.DATA_DIR || '/tmp/tru-data';
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log(`📦 Using DATA_DIR: ${DATA_DIR}`);
```

### Fix 3: Test Persistance
```bash
# Terminal:
curl http://localhost:5000/api/health

# Output devrait montrer:
{
  "status": "OK",
  "dataFile": "EXISTS",
  "dataSize": 2048,
  "persistentStorage": "YES"
}
```

---

## ❓ QUESTIONS FRÉQUENTES

**Q: Combien de temps pour migrer vers SQL?**  
A: 4-6 heures avec le code fourni + 1 heure de tests

**Q: Les données JSON seront perdues?**  
A: Non! Script de migration fourni pour importer JSON → PostgreSQL

**Q: Et si Render Database down?**  
A: Fallback automatique vers data.json.backup

**Q: Performance améliorée?**  
A: 100-1000x plus rapide pour requêtes complexes

**Q: Coût additionnel?**  
A: 0$ (Render PostgreSQL gratuit)

---

## 📚 LINKS & RESSOURCES

- [Render Persistent Disks](https://render.com/docs/persistent-disks)
- [Render PostgreSQL](https://render.com/docs/databases)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [PlanetScale Docs](https://planetscale.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Express + PostgreSQL](https://blog.logrocket.com/build-rest-api-express-postgres/)

---

*Diagnostic & Solutions - TRU GROUP Data Persistence*  
*Version 1.0 - Février 2026*
