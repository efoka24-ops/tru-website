# 🐘 PostgreSQL MIGRATION GUIDE - TRU GROUP

**Durée estimée:** 6 heures (Setup + Migration + Test)  
**Difficulté:** Intermédiaire  
**Risque:** Faible (JSON backup automatique)

---

## 📋 ÉTAPE 1: SETUP RENDER POSTGRESQL (15 min)

### 1.1 Créer une instance PostgreSQL gratuite

```
1. Aller à render.com
2. Dashboard → New
3. Sélectionner "PostgreSQL"
4. Configurer:
   - Region: Paris (eu-north-1) pour proche de vous
   - Name: tru-backend-db
   - Database: tru_group
   - User: tru_user
   - Password: [générer complexe]
5. Cliquer "Create Database"
```

### 1.2 Récupérer les identifiants

```
Copies ces valeurs:
- DATABASE_URL: postgresql://user:pass@host:5432/db
- INTERNAL_DATABASE_URL: postgresql://user:pass@internal-host:5432/db
- Host: host
- User: user
- Password: pass
- Database: tru_group
```

### 1.3 Ajouter à Render Backend Environment

```
Render Dashboard → Backend Service → Settings
Environment:
  DATABASE_URL: [copier depuis PostgreSQL]
  NODE_ENV: production
  DATA_BACKUP: /data/backup.json
```

---

## 🔧 ÉTAPE 2: SETUP LOCAL POUR TEST (20 min)

### 2.1 Installer PostgreSQL localement

**Windows (WSL2):**
```bash
# Dans WSL2 Ubuntu terminal
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo service postgresql start

# Vérifier:
psql --version
```

**Alternative: Docker Compose**
```bash
# Créer docker-compose.test.yml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: tru_group
      POSTGRES_USER: tru_user
      POSTGRES_PASSWORD: tru_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:

# Lancer:
docker-compose -f docker-compose.test.yml up
```

### 2.2 Installer packages Node.js

```bash
cd backend
npm install pg dotenv

# Vérifier:
npm list pg
```

### 2.3 Tester connexion

```bash
# Créer backend/.env.test
DATABASE_URL="postgresql://tru_user:tru_password@localhost:5432/tru_group"
NODE_ENV="development"

# Tester:
node -e "
const pg = require('pg');
const pool = new pg.Pool({
  connectionString: 'postgresql://tru_user:tru_password@localhost:5432/tru_group'
});
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? '❌ Connection failed' : '✅ Connected:');
  console.log(res?.rows?.[0]);
  process.exit(0);
});
"
```

---

## 🗂️ ÉTAPE 3: CRÉER DB HELPER (10 min)

### 3.1 Créer backend/lib/db.js

```javascript
// backend/lib/db.js
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  // Connection pooling
  max: 20, // maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Error handling
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

/**
 * Execute query
 * @param {string} text SQL query
 * @param {array} params Query parameters
 * @returns {Promise}
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.DEBUG_SQL === 'true') {
      console.log(`  Query: ${text}`);
      console.log(`  Params: ${JSON.stringify(params)}`);
      console.log(`  Duration: ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    console.error('Database Query Error:', {
      message: error.message,
      query: text,
      params,
    });
    throw error;
  }
};

/**
 * Get a client for transactions
 */
export const getClient = async () => {
  return pool.connect();
};

/**
 * Health check
 */
export const healthCheck = async () => {
  try {
    const result = await query('SELECT NOW() as time');
    return {
      status: 'healthy',
      time: result.rows[0].time
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message
    };
  }
};

/**
 * Graceful shutdown
 */
export const disconnect = async () => {
  await pool.end();
};

export default pool;
```

### 3.2 Ajouter to server.js

```javascript
// À ajouter tout en haut
import * as db from './lib/db.js';

// À ajouter à la fin avant process.exit()
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await db.disconnect();
  process.exit(0);
});

// Endpoint pour santé DB
app.get('/api/health/db', async (req, res) => {
  const health = await db.healthCheck();
  res.status(health.status === 'healthy' ? 200 : 500).json(health);
});
```

---

## 📦 ÉTAPE 4: MIGRER DONNÉES JSON → POSTGRESQL (15 min)

### 4.1 Lancer la migration

```bash
cd backend

# Option A: Script fourni
npm install --save-dev dotenv
node lib/postgres-migration.js

# Output expected:
# 🚀 Starting PostgreSQL Migration
# ✅ Connection successful
# 🔨 Creating PostgreSQL schema...
# ✅ Schema created successfully
# 📦 Migrating Services...
# ✅ 6 services migrated
# 📦 Migrating Solutions...
# ✅ 8 solutions migrated
# 📦 Migrating Team Members...
# ✅ 12 team members migrated
# 📦 Migrating Contacts/Messages...
# ✅ 3 contacts migrated
# ✅ Migration completed successfully!
```

### 4.2 Vérifier les données

```bash
# Vérifier dans PostgreSQL
psql postgresql://tru_user:tru_password@localhost:5432/tru_group

# Dans le terminal psql:
SELECT COUNT(*) FROM services;
SELECT * FROM services LIMIT 1;
\dt  # List tables
```

---

## 🔄 ÉTAPE 5: CONVERTIR LES ROUTES (1-2 h)

### 5.1 Services Routes

**AVANT (JSON):**
```javascript
app.get('/api/services', (req, res) => {
  const data = readData();
  res.json(data.services || []);
});

app.post('/api/services', (req, res) => {
  const data = readData();
  const newService = { id: Date.now(), ...req.body };
  data.services.push(newService);
  writeData(data);
  res.json(newService);
});
```

**APRÈS (PostgreSQL):**
```javascript
import * as db from '../lib/db.js';

// GET all services
app.get('/api/services', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM services ORDER BY ordering, created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single service
app.get('/api/services/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM services WHERE id = $1',
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create service
app.post('/api/services', async (req, res) => {
  const { name, description, icon, features, objective, color, image_url } = req.body;
  
  if (!name) {
    return res.status(400).json({ success: false, error: 'Name required' });
  }
  
  try {
    const result = await db.query(
      `INSERT INTO services (name, description, icon, features, objective, color, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, icon, JSON.stringify(features), objective, color, image_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ success: false, error: 'Service already exists' });
    }
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update service
app.put('/api/services/:id', async (req, res) => {
  const { name, description, icon, features, objective, color, image_url } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE services 
       SET name = $1, description = $2, icon = $3, features = $4, 
           objective = $5, color = $6, image_url = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, description, icon, JSON.stringify(features), objective, color, image_url, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE service
app.delete('/api/services/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM services WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 5.2 Team Routes

```javascript
// GET all team
app.get('/api/team', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM team ORDER BY ordering, created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create team member
app.post('/api/team', async (req, res) => {
  const { name, email, role, department, bio, photo_url, phone } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO team (name, email, role, department, bio, photo_url, phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, role, department, bio, photo_url, phone]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update team
app.put('/api/team/:id', async (req, res) => {
  const { name, email, role, department, bio, photo_url, phone } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE team 
       SET name = $1, email = $2, role = $3, department = $4, 
           bio = $5, photo_url = $6, phone = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, email, role, department, bio, photo_url, phone, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE team
app.delete('/api/team/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM team WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 5.3 Solutions Routes

```javascript
// GET all solutions
app.get('/api/solutions', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM solutions ORDER BY ordering, created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create solution
app.post('/api/solutions', async (req, res) => {
  const { name, description, target_audience, features, benefits, pricing, demo_url } = req.body;
  
  try {
    const result = await db.query(
      `INSERT INTO solutions (name, description, target_audience, features, benefits, pricing, demo_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description, target_audience, JSON.stringify(features), JSON.stringify(benefits), pricing, demo_url]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update solution
app.put('/api/solutions/:id', async (req, res) => {
  const { name, description, target_audience, features, benefits, pricing, demo_url } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE solutions 
       SET name = $1, description = $2, target_audience = $3, features = $4,
           benefits = $5, pricing = $6, demo_url = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [name, description, target_audience, JSON.stringify(features), JSON.stringify(benefits), pricing, demo_url, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE solution
app.delete('/api/solutions/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM solutions WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### 5.4 Contacts Routes

```javascript
// GET all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM contacts ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create contact (from form submission)
app.post('/api/contacts', async (req, res) => {
  const { name, email, phone, message } = req.body;
  
  if (!name || !message) {
    return res.status(400).json({ success: false, error: 'Name and message required' });
  }
  
  try {
    const result = await db.query(
      `INSERT INTO contacts (name, email, phone, message, status)
       VALUES ($1, $2, $3, $4, 'new')
       RETURNING *`,
      [name, email, phone, message]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update contact status
app.put('/api/contacts/:id', async (req, res) => {
  const { status, notes } = req.body;
  
  try {
    const result = await db.query(
      `UPDATE contacts 
       SET status = $1, notes = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [status, notes, req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE contact
app.delete('/api/contacts/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM contacts WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Not found' });
    }
    
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## ✅ ÉTAPE 6: TESTER LOCALEMENT (30 min)

### 6.1 Démarrer le serveur

```bash
cd backend

# S'assurer DB est en cours d'exécution
# docker-compose -f docker-compose.test.yml up (dans autre terminal)

# Lancer le serveur
npm start

# Output attendu:
# ✅ Server running on port 5000
# ✅ Database connected
```

### 6.2 Tester les endpoints

```bash
# GET services
curl http://localhost:5000/api/services

# POST service
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Test",
    "description": "Test description",
    "icon": "test.svg"
  }'

# PUT service
curl -X PUT http://localhost:5000/api/services/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Test Updated",
    "description": "Updated description"
  }'

# DELETE service
curl -X DELETE http://localhost:5000/api/services/1

# Health check
curl http://localhost:5000/api/health/db
```

### 6.3 Tester Backoffice

```bash
# Recharger les services dans Backoffice
# Les données devraient maintenant venir de PostgreSQL
# Faire des modifications et vérifier qu'elles persisten
```

---

## 🚀 ÉTAPE 7: DÉPLOYER SUR RENDER (15 min)

### 7.1 Mettre à jour render.yaml

```yaml
services:
  - type: web
    name: tru-backend
    env: node
    region: eu
    
    # Git config
    repo: https://github.com/username/tru-backend
    branch: main
    buildCommand: npm install
    startCommand: npm start
    
    # Environment
    envVars:
      - key: DATABASE_URL
        scope: build,runtime
        sync: false
      - key: NODE_ENV
        value: production
      - key: DATA_BACKUP
        value: /data/backup.json
    
    # Disk for backups
    disk:
      name: backup
      mountPath: /data
      sizeGB: 1
    
    # Health check
    healthCheckPath: /api/health/db
    healthCheckInterval: 60
```

### 7.2 Ajouter DATABASE_URL

```
Render Dashboard → Backend Service → Environment
Ajouter:
  DATABASE_URL: postgresql://user:pass@host:5432/database
```

### 7.3 Déployer

```bash
git add .
git commit -m "chore: migrate to PostgreSQL"
git push render main

# Suivre les logs:
# Render Dashboard → Services → tru-backend → Logs
```

### 7.4 Vérifier sur Production

```bash
# Health check
curl https://tru-backend-xyz.onrender.com/api/health/db

# GET services
curl https://tru-backend-xyz.onrender.com/api/services

# Expected: Données depuis PostgreSQL
```

---

## 🔒 ÉTAPE 8: FALLBACK & SÉCURITÉ (20 min)

### 8.1 Ajouter fallback à JSON

```javascript
// backend/lib/db-fallback.js

import * as db from './db.js';
import * as jsonDb from '../dataManager.js';

/**
 * Execute avec fallback JSON
 */
export async function queryWithFallback(text, params) {
  try {
    return await db.query(text, params);
  } catch (error) {
    console.warn('⚠️ PostgreSQL failed, falling back to JSON');
    console.warn(error.message);
    
    // Fallback logic
    if (text.includes('SELECT') && text.includes('FROM services')) {
      const data = jsonDb.readData();
      return { rows: data.services || [] };
    }
    
    // Autres fallbacks...
    throw error;
  }
}
```

### 8.2 Ajouter Scheduled Backup

```javascript
// backend/lib/db-backup.js

import * as db from './db.js';
import { writeData } from '../dataManager.js';
import cron from 'node-cron';

async function backupDatabaseToJSON() {
  try {
    const [services, team, solutions, contacts] = await Promise.all([
      db.query('SELECT * FROM services'),
      db.query('SELECT * FROM team'),
      db.query('SELECT * FROM solutions'),
      db.query('SELECT * FROM contacts')
    ]);

    const backup = {
      services: services.rows,
      team: team.rows,
      solutions: solutions.rows,
      contacts: contacts.rows,
      backedUpAt: new Date().toISOString()
    };

    writeData(backup);
    console.log('✅ Database backed up to JSON');
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
  }
}

// Schedule: Daily at 2 AM
cron.schedule('0 2 * * *', backupDatabaseToJSON);

export { backupDatabaseToJSON };
```

### 8.3 Ajouter Monitoring

```javascript
// backend/middleware/dbMonitor.js

export function dbMonitorMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow response: ${req.method} ${req.path} took ${duration}ms`);
    }
  });
  
  next();
}

// Ajouter à server.js:
// app.use(dbMonitorMiddleware);
```

---

## 📊 ÉTAPE 9: VALIDATION & TESTS (30 min)

### 9.1 Checkliste Migration

```
✅ PostgreSQL instance créée sur Render
✅ Données migrées (6 services, 12 team, 8 solutions)
✅ Database helper créé (lib/db.js)
✅ Routes converties vers SQL
✅ Tests locaux passent
✅ Backoffice fonctionne avec PostgreSQL
✅ Backup JSON fonctionne
✅ Fallback JSON fonctionne
✅ Monitoring en place
✅ Deployed sur Render
✅ Production URLs testées
✅ Données persistent après redémarrage
```

### 9.2 Tests de Stress

```bash
# Générer du trafic pour tester
ab -n 1000 -c 10 http://localhost:5000/api/services

# Vérifier performance:
# - Réponses < 100ms sans DB cache
# - Connection pool < 20 connections
# - Memory < 100MB
```

### 9.3 Rollback Plan

```
Si problème sur production:
1. Garder dernière version JSON
2. Déployer ancien code JSON (npm script)
3. Restaurer data.json depuis backup
4. Vérifier que services marchent
5. Diagnostiquer problème PostgreSQL
6. Re-migrer une fois fixé
```

---

## 🎉 RÉSULTAT FINAL

**Avant (JSON):**
- ❌ Données perdues au redémarrage
- ❌ Pas de concurrence
- ❌ Pas de backup automatique
- ❌ Requêtes lentes (secondes)

**Après (PostgreSQL):**
- ✅ Persistance garantie
- ✅ Support concurrence multi-utilisateur
- ✅ Backup auto toutes les nuits
- ✅ Requêtes rapides (millisecondes)
- ✅ Scalable jusqu'à millions de records
- ✅ Fallback JSON comme backup
- ✅ Monitoring et alertes

---

**Status: MIGRATION GUIDE COMPLET**  
*Prêt pour implémentation immédiate*
