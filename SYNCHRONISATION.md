# 🔄 Architecture de Synchronisation - TRU Website

## Vue d'ensemble

La plateforme TRU utilise une architecture multi-services avec synchronisation bidirectionnelle des données d'équipe:

```
┌─────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE GLOBALE                      │
└─────────────────────────────────────────────────────────────┘

Backend Principal (Port 5000)
├── GET  /api/team           → Récupère l'équipe
├── POST /api/team           → Crée un membre
├── PUT  /api/team/:id       → Modifie un membre
└── DELETE /api/team/:id     → Supprime un membre
    │
    ├─────────────────────────────────────────────────────────┐
    │                                                           │
    ▼                                                           ▼
Backoffice Admin (3001)                            Site TRU (5173/3000)
├── Crée/Modifie/Supprime                         ├── Affiche l'équipe
├── Synchronise → Backend                         └── Récupère du Backend
└── Notifie les clients
    │
    ├─────────────────────────────┐
    │                             │
    ▼                             ▼
Frontend Admin (5173)      Données (data.json)
├── Reçoit les notifs
└── Rafraîchit en temps réel
```

## 🔌 Flux de Synchronisation

### 1️⃣ Création d'un membre

```
Backoffice (3001)
    │ Crée un membre
    ▼
Backend Principal (5000) - POST /api/team
    │ Sauvegarde dans data.json
    ▼
Réponse au Backoffice
    │ Notifie les clients
    ├─→ Frontend Admin (5173)
    └─→ Site TRU (3000)
```

### 2️⃣ Modification d'un membre

```
Backoffice (3001)
    │ Modifie un membre
    ▼
Backend Principal (5000) - PUT /api/team/:id
    │ Met à jour dans data.json
    ▼
Tous les clients sont notifiés
    ├─→ Frontend Admin: Rafraîchit la liste
    └─→ Site TRU: Affiche les changements
```

### 3️⃣ Suppression d'un membre

```
Backoffice (3001)
    │ Supprime un membre
    ▼
Backend Principal (5000) - DELETE /api/team/:id
    │ Retire de data.json
    ▼
Clients notifiés
    ├─→ Frontend Admin: Retire de la liste
    └─→ Site TRU: Retire de l'affichage
```

## 🌐 Endpoints API

### Backend Principal (Port 5000)

```javascript
// Récupérer l'équipe
GET /api/team
Response: [ { id, name, title, bio, image, is_founder, specialties... } ]

// Créer un membre
POST /api/team
Body: { name, title, bio, image, is_founder, specialties... }
Response: { id, name, ... }

// Modifier un membre
PUT /api/team/:id
Body: { name, title, bio, ... }
Response: { id, name, ... }

// Supprimer un membre
DELETE /api/team/:id
Response: { id, name, ... }

// Vérifier la santé
GET /api/health
Response: { status: "Server is running" }

// Synchronisation
GET /api/sync/status
Response: { status, lastSync, dataCount... }
```

### Backoffice (Port 3001)

```javascript
// Récupère l'équipe du Backend (port 5000)
// Crée/Modifie/Supprime un membre
// Synchronise automatiquement avec Backend
```

### Frontend/Site TRU (Port 5173/3000)

```javascript
// Récupère l'équipe du Backend (port 5000)
GET /api/team

// Polling toutes les 30 secondes pour les mises à jour
const pollInterval = setInterval(() => {
  apiService.getTeam().then(data => {
    if (data && data.length > 0) {
      setTeamData(data);
    }
  });
}, 30000);
```

## 📊 Flux de Données

### Ajouter un Membre

```
┌──────────────────────┐
│ Backoffice (3001)    │
│ Remplir le formulaire│
└──────────┬───────────┘
           │
           ▼
┌──────────────────────────────────────────┐
│ syncTeamToFrontend('create', member)     │
└──────────┬───────────────────────────────┘
           │
    ┌──────┴──────┬────────────┐
    │             │            │
    ▼             ▼            ▼
  Backend    Frontend      Site TRU
  (5000)     (5173)        (3000)
  POST       POST          POST
  /team      /team-update  /team-update
    │             │            │
    └──────┬──────┴────────┬───┘
           │               │
           ▼               ▼
   ✅ Sauvegardé    ✅ Notification reçue
           │               │
           └───────┬───────┘
                   │
                   ▼
           ✅ Rafraîchissement
```

## 🔐 Ordre de Priorité (Fallback)

Quand on récupère l'équipe:

1. **Backend Principal** (Port 5000) - Source de vérité
2. **Site TRU** (Port 3000)
3. **Frontend Admin** (Port 5173)
4. **Base44 Backend** (Dernier recours)

## 📈 Monitoring de la Synchronisation

Le Dashboard affiche l'état de chaque service:

- ✅ **Connecté** - Service fonctionne normalement
- ⚠️ **Vérification** - Vérification en cours
- ❌ **Hors ligne** - Service non disponible
- 🚨 **Erreur** - Problème de communication

Vérification automatique: **Toutes les 30 secondes**

## 🛠️ Configuration

### Variables d'environnement

```env
# Backend
PORT=5000

# Backoffice
VITE_BACKOFFICE_PORT=3001

# Frontend
VITE_FRONTEND_PORT=5173

# Site TRU
VITE_SITE_PORT=3000
```

### URLs API

```javascript
// Backend Principal
const BACKEND_API_URL = 'http://localhost:5000/api'

// Backoffice
const BACKOFFICE_API_URL = 'http://localhost:3001/api'

// Frontend
const FRONTEND_API_URL = 'http://localhost:5173/api'

// Site TRU
const TRU_SITE_URL = 'http://localhost:3000/api'
```

## 🚀 Démarrage

### Terminal 1 - Backend (Port 5000)
```bash
cd backend
npm install
npm start
```

### Terminal 2 - Backoffice (Port 3001)
```bash
cd backoffice
npm install
npm run dev
```

### Terminal 3 - Frontend/Site TRU (Port 5173)
```bash
cd site_tru
npm install
npm run dev
```

## ✅ Test de la Synchronisation

1. Ouvrir Backoffice: `http://localhost:3001`
2. Aller à Équipe (EquipePage)
3. Ajouter/Modifier/Supprimer un membre
4. Vérifier que le changement apparaît dans:
   - Site TRU: `http://localhost:3000/team`
   - Backend: `http://localhost:5000/api/team`

## 🐛 Dépannage

### L'équipe ne se synchronise pas

1. Vérifier que le Backend est actif: `http://localhost:5000/api/health`
2. Vérifier les logs du Backoffice (console)
3. Vérifier dans la console du navigateur les erreurs de fetch
4. S'assurer que CORS est activé sur le Backend

### Les données ne s'affichent pas

1. Vérifier que `data.json` existe dans `/backend`
2. Vérifier que le format JSON est correct
3. Recharger le navigateur
4. Vérifier la console pour les erreurs

### Performance lente

1. Réduire la fréquence de polling (actuellement 30s)
2. Vérifier que le Backend n'est pas surchargé
3. Vérifier la connexion réseau
4. Vérifier les performances des requêtes API

## 📝 Notes Importantes

- ✅ Tous les changements sont persistants (sauvegardés dans `data.json`)
- ✅ La synchronisation est automatique
- ✅ Les données ont un ordre de priorité (Backend > Site > Frontend > Base44)
- ✅ Le polling assure les mises à jour en temps réel
- ⚠️ CORS doit être activé sur tous les services
- ⚠️ Les ports doivent être correctement configurés
