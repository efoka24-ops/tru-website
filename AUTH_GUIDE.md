# 🔐 SYSTÈME D'AUTHENTIFICATION - Guide d'utilisation

## ✅ Ce qui a été créé:

1. **backend/lib/auth.js** - Système d'authentification complet
   - Hashage bcrypt (10 rounds)
   - Génération/vérification JWT
   - Middlewares de protection
   - Validation mot de passe

2. **backend/routes/auth.js** - Routes API
   - POST /api/auth/login
   - POST /api/auth/register
   - GET /api/auth/me
   - PUT /api/auth/change-password
   - POST /api/auth/logout

3. **backend/scripts/create-admin.js** - Script de création admin

---

## 🚀 INSTALLATION

### 1. Installer les packages

```powershell
cd backend
npm install
```

Cela installera:
- `bcrypt` (hashage mots de passe)
- `jsonwebtoken` (tokens JWT)

### 2. Créer un admin

```powershell
npm run create-admin
```

**Le script vous demandera:**
```
Nom complet: Admin TRU GROUP
Email: admin@trugroup.cm
Options de mot de passe:
1. Générer un mot de passe sécurisé automatiquement
2. Choisir mon propre mot de passe
Votre choix (1 ou 2): 1

✅ Mot de passe généré: Tr4&Admin!2026$Sec
⚠️  Sauvegardez-le dans un endroit sûr!
```

---

## 🔑 UTILISATION DES ROUTES

### 1. Login (Connexion)

```bash
# Request
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@trugroup.cm",
  "password": "Tr4&Admin!2026$Sec"
}

# Response
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "admin@trugroup.cm",
      "name": "Admin TRU GROUP",
      "role": "admin",
      "active": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "7d"
  }
}
```

### 2. Obtenir infos utilisateur connecté

```bash
# Request
GET http://localhost:5000/api/auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Response
{
  "success": true,
  "data": {
    "id": 1,
    "email": "admin@trugroup.cm",
    "name": "Admin TRU GROUP",
    "role": "admin",
    "active": true
  }
}
```

### 3. Changer mot de passe

```bash
# Request
PUT http://localhost:5000/api/auth/change-password
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "currentPassword": "Tr4&Admin!2026$Sec",
  "newPassword": "NewSecure!Pass2026$"
}

# Response
{
  "success": true,
  "message": "Mot de passe changé avec succès"
}
```

---

## 🛡️ PROTÉGER VOS ROUTES

### Exemple 1: Route protégée (authentification requise)

```javascript
import * as auth from './lib/auth.js';

// Seuls les utilisateurs connectés peuvent accéder
app.get('/api/protected', auth.authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'Route protégée',
    user: req.user // Infos de l'utilisateur connecté
  });
});
```

### Exemple 2: Route admin uniquement

```javascript
import * as auth from './lib/auth.js';

// Seuls les admins peuvent accéder
app.delete('/api/services/:id', auth.authenticateAdmin, async (req, res) => {
  // Seul un admin peut supprimer un service
  await db.services.delete(req.params.id);
  res.json({ success: true });
});
```

### Exemple 3: Protection partielle

```javascript
// GET: Public
app.get('/api/services', async (req, res) => {
  const services = await db.services.getAll();
  res.json({ success: true, data: services });
});

// POST: Admin seulement
app.post('/api/services', auth.authenticateAdmin, async (req, res) => {
  const service = await db.services.create(req.body);
  res.json({ success: true, data: service });
});
```

---

## 🔐 RÈGLES DE MOT DE PASSE

**Minimum requis:**
- ✅ 8 caractères minimum
- ✅ Au moins 1 majuscule (A-Z)
- ✅ Au moins 1 minuscule (a-z)
- ✅ Au moins 1 chiffre (0-9)
- ✅ Au moins 1 caractère spécial (!@#$%^&*...)

**Exemples valides:**
- `Tr4&Admin!2026$Sec`
- `MySecure#Pass123`
- `Admin@TRU2026!`

---

## 📝 INTÉGRATION AVEC SERVER.JS

Ajouter ces lignes à `backend/server.js`:

```javascript
// Importer les routes auth
import authRoutes from './routes/auth.js';

// Ajouter les routes (avant les autres routes)
app.use('/api/auth', authRoutes);

// Exemple: Protéger les routes admin
import * as auth from './lib/auth.js';

// Services (GET public, POST/PUT/DELETE admin)
app.get('/api/services', async (req, res) => { /* ... */ });
app.post('/api/services', auth.authenticateAdmin, async (req, res) => { /* ... */ });
app.put('/api/services/:id', auth.authenticateAdmin, async (req, res) => { /* ... */ });
app.delete('/api/services/:id', auth.authenticateAdmin, async (req, res) => { /* ... */ });
```

---

## 🔒 SÉCURITÉ

### 1. JWT Secret (Important!)

Ajoutez à `.env`:

```bash
JWT_SECRET=votre_secret_tres_long_et_aleatoire_ici_minimum_64_caracteres
```

Générer un secret sécurisé:

```powershell
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. HTTPS en production

Toujours utiliser HTTPS en production pour protéger les tokens.

### 3. Durée du token

Par défaut: 7 jours. Modifier dans `lib/auth.js`:

```javascript
const JWT_EXPIRES_IN = '1d'; // 1 jour
const JWT_EXPIRES_IN = '12h'; // 12 heures
```

---

## 🧪 TESTER L'AUTHENTIFICATION

### Test 1: Créer un admin

```powershell
npm run create-admin
```

### Test 2: Login

```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"admin@trugroup.cm","password":"VotreMotDePasse"}'
```

### Test 3: Accéder à une route protégée

```powershell
curl http://localhost:5000/api/auth/me `
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## ✅ PROCHAINES ÉTAPES

1. **Installer les packages:**
   ```powershell
   npm install
   ```

2. **Créer le compte admin:**
   ```powershell
   npm run create-admin
   ```

3. **Ajouter JWT_SECRET au .env:**
   ```bash
   JWT_SECRET=votre_secret_64_caracteres
   ```

4. **Intégrer les routes dans server.js**

5. **Tester le login**

---

**✅ Système d'authentification complet et sécurisé!**  
*bcrypt + JWT + Middlewares + Validation*
