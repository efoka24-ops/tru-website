# ✅ Configuration Authentification Supabase - TERMINÉE

## 🎯 Modifications effectuées

### 1. Backend (Port 5000)
✅ **Authentification Supabase activée**
- Routes `/api/auth/*` utilisent Supabase PostgreSQL
- Plus de connexion Render/Railway PostgreSQL
- Backups GitHub désactivés
- Vérifications checksum désactivées
- Data.json utilisé uniquement pour les données (team, services, solutions)

✅ **Fichiers modifiés:**
- `backend/server.js` - Supabase uniquement
- `backend/routes/auth.js` - Routes d'authentification
- `backend/lib/auth.js` - Fonctions bcrypt + JWT
- `backend/.env` - DATABASE_URL commenté

### 2. Backoffice
✅ **Login.jsx mis à jour**
- Appelle `/api/auth/login` au lieu des identifiants hardcodés
- Utilise le token JWT retourné par Supabase
- Stocke le token dans localStorage

✅ **Configuration API:**
- `.env.local` → `http://localhost:5000` (développement)
- `.env.production` → URL de production Render

### 3. Compte Admin Supabase
✅ **Créé et configuré:**
- Email: `adminfoka@trugroup.com`
- Mot de passe: `Admin@TRU2026!`
- Rôle: `admin`
- Actif: `true`

## 🔐 IDENTIFIANTS DE CONNEXION

### Backoffice (http://localhost:3000 ou https://bo.trugroup.cm)
```
📧 Email: adminfoka@trugroup.com
🔑 Mot de passe: Admin@TRU2026!
```

## 🚀 Démarrage des serveurs

### 1. Backend (déjà démarré)
```powershell
cd backend
node server.js
```
✅ Écoute sur `http://localhost:5000`

### 2. Backoffice
```powershell
cd backoffice
npm run dev
```
🌐 Accès: `http://localhost:3000` (ou le port Vite par défaut)

### 3. Site Frontend (optionnel)
```powershell
npm run dev
```
🌐 Accès: `http://localhost:5173`

## 🧪 Test de connexion

### Méthode 1: Via le Backoffice (Recommandé)
1. Ouvrir http://localhost:3000 (ou le port backoffice)
2. Entrer:
   - Email: `adminfoka@trugroup.com`
   - Mot de passe: `Admin@TRU2026!`
3. Cliquer sur "Se connecter"
4. ✅ Vous devriez être redirigé vers le dashboard

### Méthode 2: Test API direct (PowerShell)
```powershell
$body = @{
    email = "adminfoka@trugroup.com"
    password = "Admin@TRU2026!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $body -ContentType "application/json"

# Afficher la réponse
$response
```

**Résultat attendu:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "email": "adminfoka@trugroup.com",
    "name": "Admin Foka",
    "role": "admin"
  },
  "expiresIn": "7d"
}
```

### Méthode 3: Test avec curl
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"adminfoka@trugroup.com","password":"Admin@TRU2026!"}'
```

## 📊 Architecture de communication

```
┌─────────────────┐
│   BACKOFFICE    │
│  (React Vite)   │
│  Port 3000      │
└────────┬────────┘
         │ HTTP
         │ POST /api/auth/login
         ▼
┌─────────────────┐
│    BACKEND      │
│   (Express)     │
│   Port 5000     │
│                 │
│  Routes:        │
│  /api/auth/*    │
└────────┬────────┘
         │ Supabase SDK
         │ @supabase/supabase-js
         ▼
┌─────────────────┐
│    SUPABASE     │
│   PostgreSQL    │
│  (En ligne)     │
│                 │
│  Table: users   │
└─────────────────┘
```

## 🔒 Sécurité

### JWT Secret
- Généré automatiquement (128 caractères hex)
- Stocké dans `backend/.env`
- Expire après 7 jours

### Mot de passe
- Hash bcrypt avec 10 salt rounds
- Stocké dans Supabase: `password_hash`
- Ne JAMAIS stocker en clair

### Token Storage
- Frontend: `localStorage.setItem('authToken', token)`
- Inclus dans les requêtes: `Authorization: Bearer <token>`

## 🐛 Résolution de problèmes

### ❌ Erreur "Email ou mot de passe incorrect"
**Causes possibles:**
1. Le compte n'existe pas dans Supabase
2. Le mot de passe est incorrect
3. Le backend n'est pas démarré

**Solution:**
```powershell
# Vérifier que le backend tourne
Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue

# Recréer le compte admin
cd backend
node scripts/create-admin-supabase.js
```

### ❌ Erreur "Impossible de contacter le serveur"
**Cause:** Backend non démarré ou mauvaise URL

**Solution:**
```powershell
# Démarrer le backend
cd backend
node server.js
```

### ❌ Port 5000 déjà utilisé
**Solution:**
```powershell
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### ❌ Variables d'environnement manquantes
**Vérifier `backend/.env`:**
```env
SUPABASE_URL=https://lupnscaeituljcddaagk.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=1666986b8806cc52ce466224e8fa494c...
```

## 📁 Fichiers importants

### Backend
- `backend/server.js` - Serveur Express principal
- `backend/routes/auth.js` - Routes d'authentification Supabase
- `backend/lib/auth.js` - Fonctions auth (bcrypt, JWT)
- `backend/lib/supabase.js` - Client Supabase
- `backend/.env` - Variables d'environnement
- `backend/scripts/create-admin-supabase.js` - Script de création admin

### Backoffice
- `backoffice/src/pages/Login.jsx` - Page de connexion
- `backoffice/src/services/api.js` - Configuration axios
- `backoffice/.env.local` - Config développement

## 🎉 Prochaines étapes

1. ✅ Tester la connexion au backoffice
2. ✅ Vérifier l'accès aux pages protégées
3. [ ] Créer d'autres comptes utilisateurs si nécessaire
4. [ ] Déployer sur Render avec les nouvelles variables d'environnement
5. [ ] Mettre à jour la documentation de prod

## 📞 Support

En cas de problème, vérifier:
1. Le backend est démarré (port 5000)
2. Le compte admin existe dans Supabase
3. Les variables d'environnement sont correctes
4. Le token JWT_SECRET est défini

---

**Date de configuration:** 19 février 2026
**Système:** Backend Express + Supabase PostgreSQL + JWT + bcrypt
**Status:** ✅ Opérationnel
