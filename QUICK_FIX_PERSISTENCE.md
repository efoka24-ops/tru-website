# ⚡ QUICK FIX - Fixer le Problème de Persistence IMMÉDIATEMENT

**Durée:** 15 minutes  
**Urgence:** 🔴 CRITIQUE  
**Résultat:** Données vont persister entre redémarrages

---

## 🔴 LE PROBLÈME

```
Vous ajoutez/modifiez des données dans le backoffice
→ Données sauvegardées dans data.json
→ À chaque redémarrage, data.json se réinitialise
→ Modifications perdues

CAUSE: Render utilise un filesystem éphémère
Quand le container redémarre, les fichiers sont supprimés
```

---

## ✅ SOLUTION RAPIDE (3 étapes)

### ÉTAPE 1: Configurer le Volume Persistant Render (5 min)

**Option A: Dashboard Render (Facile)**

```
1. Aller à render.com
2. Sélectionner votre service "tru-backend"
3. Cliquer sur "Settings"
4. Scroller jusqu'à "Disks"
5. Cliquer "Connect Disk"
6. Configurer:
   - Name: tru-data (ou n'importe quel nom)
   - Mount Path: /data
   - Size: 1 GB
7. Cliquer "Save"
8. Le service va redémarrer automatiquement
```

**Option B: render.yaml (Code)**

```yaml
# render.yaml - Ajouter ceci:

disk:
  name: tru-data
  mountPath: /data
  sizeGB: 1
```

### ÉTAPE 2: Mettre à jour backend/server.js (5 min)

```javascript
// Chercher cette ligne (environ ligne 20-30):
const DATA_DIR = process.env.DATA_DIR || __dirname;

// REMPLACER par:
const DATA_DIR = process.env.DATA_DIR || '/tmp/tru-data';

// Vérifier que le répertoire existe:
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

console.log(`📦 Using DATA_DIR: ${DATA_DIR}`);
console.log(`✅ Data will persist at: ${path.join(DATA_DIR, 'data.json')}`);
```

### ÉTAPE 3: Ajouter Variable Environnement (5 min)

**Dans Render Dashboard:**

```
1. Service Backend → Settings → Environment
2. Ajouter variable:
   Name: DATA_DIR
   Value: /data
   Scope: Runtime
3. Cliquer "Save"
```

**Ou dans render.yaml:**

```yaml
envVars:
  - key: DATA_DIR
    value: /data
    scope: runtime
```

---

## 🚀 DÉPLOYER

```bash
# Commit et push les changements
git add backend/server.js render.yaml
git commit -m "fix: add persistent storage for data.json"
git push render main

# Attendre le redéploiement (2-3 min)
# Render va:
# 1. Créer le volume persistant
# 2. Redémarrer le service
# 3. Utiliser /data pour data.json

# Vérifier dans Render Dashboard:
# Services → tru-backend → Logs
# Chercher "Using DATA_DIR: /data"
```

---

## ✅ VÉRIFIER QUE ÇA MARCHE

### Test 1: Ajouter une donnée

```bash
# Via le backoffice ou curl:
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Service","description":"Testing persistence"}'

# Voir la nouvelle donnée
curl http://localhost:5000/api/services
```

### Test 2: Redémarrer le serveur

```bash
# Localement:
# Appuyer sur Ctrl+C pour arrêter
# npm start pour redémarrer

# Sur Render:
# Aller dans Render Dashboard
# Services → tru-backend → More → Restart service
```

### Test 3: Vérifier que les données persisten

```bash
# Après redémarrage:
curl http://localhost:5000/api/services

# Les données ajoutées avant doivent TOUJOURS être là ✅
```

### Test 4: Vérifier le Health

```bash
curl http://localhost:5000/api/health

# Output:
# {
#   "status": "OK",
#   "dataFile": "EXISTS",
#   "dataSize": 2048,
#   "persistentStorage": "YES"  ← IMPORTANT: Doit dire YES
# }
```

---

## 📂 VÉRIFIER LES FICHIERS

**Localement dans WSL:**

```bash
# Voir où les données sont sauvegardées
ls -la /tmp/tru-data/

# Output attendu:
# -rw-r--r-- 1 user group 2048 Feb 18 10:30 data.json
# -rw-r--r-- 1 user group   64 Feb 18 10:30 data.json.checksum
# -rw-r--r-- 1 user group 2048 Feb 18 10:25 data.json.backup
```

**Sur Render (via Terminal):**

```
1. Render Dashboard → Services → tru-backend
2. Cliquer "Terminal"
3. Taper:
   ls -la /data/
   
4. Devrait afficher:
   data.json et data.json.backup
```

---

## 🔒 OPTIONS AVANCÉES (Optionnel)

### Option 1: GitHub Sync (Auto-backup)

```javascript
// backend/routes/admin.js - Ajouter:

app.post('/api/admin/backup-to-github', authenticateAdmin, async (req, res) => {
  try {
    const data = readData();
    
    // Commit to GitHub
    const { execSync } = require('child_process');
    execSync('git add data.json');
    execSync('git commit -m "🔄 Auto-backup: ' + new Date().toISOString() + '"');
    execSync('git push origin main');
    
    res.json({ success: true, message: 'Backed up to GitHub' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

### Option 2: Scheduled Daily Backup

```javascript
// backend/utils/scheduler.js - Ajouter:

import cron from 'node-cron';
import { execSync } = require('child_process');

// Chaque nuit à 2 AM
cron.schedule('0 2 * * *', () => {
  try {
    execSync('git add data.json');
    execSync('git commit -m "🔄 Nightly backup"');
    execSync('git push origin main');
    console.log('✅ Backup to GitHub completed');
  } catch (error) {
    console.error('❌ Backup failed:', error);
  }
});
```

### Option 3: Monitoring

```javascript
// À ajouter à server.js:

app.get('/api/admin/persistence-status', (req, res) => {
  const fs = require('fs');
  const path = require('path');
  
  const dataFile = path.join(process.env.DATA_DIR, 'data.json');
  const stats = fs.statSync(dataFile);
  
  res.json({
    dataFile: dataFile,
    fileSize: stats.size,
    lastModified: stats.mtime,
    diskSpace: process.env.DATA_DIR ? 'Persistent ✅' : 'Ephemeral ❌',
    status: stats.size > 0 ? 'OK' : 'EMPTY'
  });
});
```

---

## 🚨 SI PROBLÈME

### Problème: DATA_DIR n'existe toujours pas

```bash
# Vérifier sur Render (via Terminal):
ls -la /

# Si /data n'existe pas:
# 1. Refaire l'ajout du Disk dans Render Dashboard
# 2. Attendre le redéploiement
# 3. Vérifier: ls -la /data/
```

### Problème: Données toujours vides

```bash
# Vérifier les logs:
# Render Dashboard → Services → tru-backend → Logs

# Chercher: "Using DATA_DIR:"
# Doit afficher: "Using DATA_DIR: /data"

# Si affiche: "Using DATA_DIR: __dirname"
# → La variable DATA_DIR n'est pas configurée correctement
# → Aller à Render Dashboard → Settings → Environment
# → Vérifier DATA_DIR = /data
```

### Problème: Fichier data.json vide

```bash
# SSH to Render terminal et vérifier:
cat /data/data.json

# Si vide:
# 1. Ajouter une donnée via backoffice
# 2. Vérifier: cat /data/data.json
# 3. La nouvelle donnée doit apparaître
```

---

## 📋 CHECKLIST

- [ ] Volume Rend Disk créé avec Mount Path: /data
- [ ] backend/server.js: const DATA_DIR = process.env.DATA_DIR || '/tmp/tru-data'
- [ ] Render Environment: DATA_DIR = /data
- [ ] Backend redéployé (git push render main)
- [ ] Health check retourne persistentStorage: YES
- [ ] Test: Ajouter donnée → Redémarrer → Donnée toujours là
- [ ] Fichier data.json existe et n'est pas vide
- [ ] Backoffice peut ajouter/modifier/supprimer

---

## ✨ RÉSULTAT

```
AVANT:
❌ Données se réinitialisent à chaque redémarrage
❌ Modifications perdues
❌ Impossible d'utiliser en production

APRÈS:
✅ Données persistent entre redémarrages
✅ Modifications sauvegardées
✅ Peut publier en production
✅ Fallback JSON fonctionne
```

---

**⏱️ Temps total: 15 min  
🎯 Impact: CRITIQUE - Fixe le problème principal**

*C'est le quick fix. Pour une vraie scalabilité, migrer vers PostgreSQL après stabilisation.*
