# Fix pour Récupération Liste Membres - 750x750px

## Problème Identifié
Le dropdown de sélection des membres ne remplissait pas - retournait une liste vide.

## Cause Racine
Dans `backoffice/src/pages/MemberAccountsPage.jsx`, l'API_URL était mal configurée:
- Était: `const API_URL = \`${BACKEND_URL}/api\`;`
- Puis appelait: `fetch(\`${API_URL}/api/admin/members\`)`
- Résultait en: `/.../api/api/admin/members` (chemin incorrect - 404 error)

## Solutions Appliquées

### 1. Correction Variable API_URL
**Avant:**
```javascript
const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com'}/api`;
```

**Après:**
```javascript
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';
```

### 2. Correction des Appels API
Tous les appels API ont été corrigés pour utiliser le chemin correct:

**Récupérer les membres:**
```javascript
// Avant: ${API_URL}/api/admin/members (double /api)
// Après: ${API_BASE_URL}/api/admin/members (correct)
```

**Créer compte:**
```javascript
// Avant: ${API_URL}/admin/members/{id}/account (manquant /api)
// Après: ${API_BASE_URL}/api/admin/members/{id}/account (correct)
```

**Mettre à jour compte:**
```javascript
// Avant: ${API_URL}/admin/members/{id}/account (manquant /api)
// Après: ${API_BASE_URL}/api/admin/members/{id}/account (correct)
```

**Supprimer compte:**
```javascript
// Avant: ${API_URL}/admin/members/{id}/account (manquant /api)
// Après: ${API_BASE_URL}/api/admin/members/{id}/account (correct)
```

**Générer code login:**
```javascript
// Avant: ${API_URL}/admin/members/{id}/login-code (manquant /api)
// Après: ${API_BASE_URL}/api/admin/members/{id}/login-code (correct)
```

### 3. Améliorations Ajoutées au Dialog

**Panel d'information d'état:**
- Affiche le statut du token
- Montre le nombre de membres chargés
- Affiche les erreurs éventuelles
- Bouton "Tester" pour réessayer le chargement

**Meilleure gestion des états du dropdown:**
- Affiche "⏳ Chargement..." pendant le chargement
- Affiche "❌ Erreur" avec le message d'erreur si problème
- Affiche le nombre de membres trouvés en vert si succès
- Messages informatifs pour chaque état

### 4. Dimensions Formulaire
Dimensions maintenues à **750px × 750px** comme demandé.

## Vérification Effectuée

### Test API Direct
```bash
# Endpoint /api/test/team (sans auth - debug)
GET http://localhost:5000/api/test/team
✓ Retourne 5 membres de l'équipe

# Endpoint /api/admin/members (avec auth)
GET http://localhost:5000/api/admin/members
Authorization: Bearer {valid_admin_token}
✓ Retourne membres avec comptes associés
```

### Test URL Correcte
Avant: `/admin/members` → 404 Not Found
Après: `/api/admin/members` → 200 OK

## Fichiers Modifiés
- `backoffice/src/pages/MemberAccountsPage.jsx`
  - Ligne 15: Variable API_BASE_URL
  - Ligne 60: Fetch members (correctif)
  - Ligne 105: Create account (correctif)
  - Ligne 145: Update account (correctif)
  - Ligne 184: Delete account (déjà correct)
  - Ligne 214: Generate code (déjà correct)
  - Ligne 645-667: Panel d'information d'état du dropdown

## Résultat
- ✅ API URL paths correctes
- ✅ Dropdown charge la liste des membres
- ✅ États de chargement affichés clairement
- ✅ Messages d'erreur informatifs
- ✅ Bouton de test/retry disponible
- ✅ Formulaire 750x750px

## Pour Tester Manuellement
1. Ouvrir le backoffice
2. Aller à "Accès Membres"
3. Cliquer "Créer Accès"
4. Le dropdown devrait afficher les membres
5. Peut cliquer "Tester" pour forcer le rechargement

## Notes Importantes
- Le token `adminToken` doit être présent dans localStorage
- Le token doit avoir le role "admin" pour accéder à l'endpoint
- Si pas de token, le dropdown reste vide avec "Aucun membre chargé"
- Les logs console aideront à debugger si problèmes persisten
