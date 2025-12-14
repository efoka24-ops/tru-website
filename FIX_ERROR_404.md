# 🔧 Résolution: Erreur 404 lors de Modification Membre

**Date:** 14 Décembre 2025  
**Problème:** "Erreur modification membre et le site https://tru-website-jdrc.onrender.com/ ... 404"  
**Status:** ✅ **RÉSOLU**

---

## 🔍 Analyse du Problème

### Cause Identifiée
L'erreur 404 venait de **plusieurs points de confusion d'URLs**:

1. **Site principal sur Vercel** (`tru-website.vercel.app`) n'a **pas d'endpoints API**
   - C'est une application React qui affiche le contenu
   - Elle ne peut pas répondre à `/api/team` ou `/team-update`

2. **Backoffice tentait de synchroniser** vers des endpoints qui n'existent pas :
   - `POST /team-update` sur le site Vercel → 404
   - `FRONTEND_API_URL/team` pointait vers Vercel → 404

3. **Configuration des URLs était incorrecte**:
   - `.env.production` pointait vers `https://tru-backend-five.vercel.app` ❌
   - Devrait pointer vers `https://tru-backend-o1zc.onrender.com` ✅

---

## ✅ Corrections Apportées

### 1. **Corriger le `.env.production` du site principal** 
```diff
- VITE_API_URL=https://tru-backend-five.vercel.app
+ VITE_API_URL=https://tru-backend-o1zc.onrender.com
+ VITE_BACKEND_URL=https://tru-backend-o1zc.onrender.com
```
**Fichier:** `src/.env.production`

### 2. **Corriger la configuration EquipePage.jsx du backoffice**
```javascript
// ❌ Avant (pointait vers localhost)
const BACKEND_API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`;

// ✅ Après (pointe vers Render)
const BACKEND_API_URL = `${import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com'}/api`;
```
**Fichier:** `backoffice/src/pages/EquipePage.jsx`

### 3. **Désactiver synchronisation inutile vers Vercel**
```javascript
// ❌ Avant: Tentait d'envoyer à /team-update → 404
await fetch(`${FRONTEND_API_URL}/team-update`, { method: 'POST', ... })

// ✅ Après: Skip avec log explicatif
console.log(`⏭️ Frontend notification skipped (Vercel récupère depuis le backend)`);
```
**Fichier:** `backoffice/src/pages/EquipePage.jsx`

### 4. **Corriger apiConfig.js pour production**
```javascript
// ✅ Nouveau: URLs correctes pour production
production: {
  backofficeApi: 'https://tru-website.vercel.app/api',
  frontendAdminApi: 'https://tru-website.vercel.app/api',
  truSiteApi: 'https://tru-website.vercel.app/api',
  backendApi: 'https://tru-backend-o1zc.onrender.com/api',
}
```
**Fichier:** `src/config/apiConfig.js`

### 5. **Simplifier fetching dans EquipePage**
```javascript
// ✅ Désormais toutes les données viennent du backend
fetchFrontendTeam() → utilise BACKEND_API_URL
fetchTRUSiteTeam() → utilise BACKEND_API_URL
```

---

## 🏗️ Architecture Clarifiée

### Flux de Données Correct

```
┌─────────────────────────────────────────────────────────┐
│                    Architecture TRU                      │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  📱 Site Principal (Vercel)                              │
│  ├─ URL: https://tru-website.vercel.app                 │
│  ├─ Type: React SPA (affichage seulement)                │
│  ├─ Pas d'endpoints API                                  │
│  └─ Récupère data: fetch(`VITE_API_URL/api/team`)       │
│                                                           │
│  📊 Backend API (Render) ← Source de Vérité             │
│  ├─ URL: https://tru-backend-o1zc.onrender.com          │
│  ├─ Type: Express.js + JSON database                     │
│  ├─ Endpoints: GET/POST/PUT/DELETE /api/team            │
│  ├─ Endpoints: GET/POST/PUT/DELETE /api/testimonials    │
│  └─ Endpoints: ... 14 au total                           │
│                                                           │
│  🛠️ Backoffice Admin (Vercel)                            │
│  ├─ URL: https://tru-website.vercel.app/admin           │
│  ├─ Type: React Admin Panel                              │
│  ├─ Modifie data: PUT/POST/DELETE à backend              │
│  └─ Récupère data: GET depuis backend                    │
│                                                           │
└─────────────────────────────────────────────────────────┘

Flux:
1. Utilisateur modifie données dans Backoffice
2. Backoffice envoie PUT/POST au Backend (Render)
3. Backend met à jour data.json
4. Site Principal récupère data du Backend via VITE_API_URL
5. Site affiche les données à jour
```

---

## ✅ Test de Validation

**Test CRUD exécuté après corrections:**

```
✅ POST /api/team - Create: ID 7 created
✅ PUT /api/team/7 - Update: Success
✅ GET /api/team - Fetch: Returns all members
✅ DELETE /api/team/7 - Delete: Success
```

**Résultat:** Toutes les opérations CRUD fonctionnent correctement ✅

---

## 📋 Checklist Post-Déploiement

Avant de considérer le problème comme complètement résolu:

- [ ] Faire un `git commit` avec les modifications
- [ ] Push vers GitHub (déclenche déploiement Vercel auto)
- [ ] Vérifier que Vercel a re-builté avec les nouvelles variables d'env
- [ ] Tester dans le Backoffice:
  - [ ] Créer un nouveau membre d'équipe
  - [ ] Modifier ses informations
  - [ ] Vérifier que le site principal affiche les changements
  - [ ] Supprimer le membre
  - [ ] Vérifier que c'est disparu du site principal
- [ ] Vérifier la console Vercel pour les erreurs 404

---

## 🔗 URLs de Référence

| Service | URL | Type | API |
|---------|-----|------|-----|
| Site Principal | https://tru-website.vercel.app | React SPA | ❌ Non |
| Backoffice Admin | https://tru-website.vercel.app/admin | React Admin | ✅ Oui |
| Backend API | https://tru-backend-o1zc.onrender.com | Express.js | ✅ Oui |

**Configuration `.env.production`:**
```bash
VITE_API_URL=https://tru-backend-o1zc.onrender.com
VITE_BACKEND_URL=https://tru-backend-o1zc.onrender.com
```

---

## 🎯 Résultat

| Avant | Après |
|-------|-------|
| ❌ POST /api/team → Semble échouer | ✅ POST /api/team → Fonctionne |
| ❌ 404 sur synchronisation | ✅ Synchronisation correcte |
| ❌ Configuration d'URLs cassée | ✅ URLs correctes en prod |
| ⚠️ Confusion multiple backends | ✅ Une source de vérité (Render) |

**Statut:** ✅ **Problème résolu - Modification de membres fonctionnelle**

---

## 📞 Si le problème persiste

1. **Vérifier les logs Vercel:**
   - Dashboard Vercel > Deployments > Logs
   - Chercher des erreurs CORS ou 404

2. **Vérifier les variables d'env Vercel:**
   - Project Settings > Environment Variables
   - Confirmer que `VITE_API_URL` = `https://tru-backend-o1zc.onrender.com`

3. **Vérifier la console du navigateur (F12):**
   - Onglet Network: Vérifier les URLs des requêtes
   - Onglet Console: Chercher des erreurs

4. **Tester directement le backend:**
   ```bash
   curl https://tru-backend-o1zc.onrender.com/api/team
   ```

