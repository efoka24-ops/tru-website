# 🔐 Guide de Reconnexion - Backoffice TRU

## ⚠️ Problème: Erreurs 401 Unauthorized

Vous voyez les erreurs `401 Unauthorized` parce que votre **token JWT est expiré**.

## ✅ Solution: Se Reconnecter (1 minute)

### ÉTAPE 1️⃣ - Ouvrir la Console

1. Dans votre navigateur backoffice, appuyez sur **F12**
2. Cliquez sur l'onglet **"Console"**

### ÉTAPE 2️⃣ - Effacer le Token Expiré

Dans la console, tapez exactement ceci et appuyez sur Entrée :

```javascript
localStorage.clear()
```

Vous verrez apparaître `undefined` → C'est normal ✅

### ÉTAPE 3️⃣ - Se Reconnecter

1. Appuyez sur **F5** pour rafraîchir la page
2. La page de **login** apparaîtra
3. Entrez vos identifiants admin
4. Cliquez sur **"Se connecter"**

## 🎯 Résultat Attendu

Après reconnexion :
- ✅ Nouveau token JWT généré (valide 24h)
- ✅ Plus d'erreurs 401
- ✅ Menu **Formations** : 43 formations visibles
- ✅ Menu **Inscriptions** : Page accessible

## 📊 État du Système

| Composant | État |
|-----------|------|
| **Backend** | ✅ Fonctionnel (port 5000) |
| **Supabase** | ✅ Tables créées, 43 formations |
| **Endpoints** | ✅ Protégés avec verifyToken + requireAdmin |
| **Backoffice Code** | ✅ Toutes corrections appliquées |
| **Token JWT** | ❌ **EXPIRÉ → SE RECONNECTER** |

## 🔍 Vérification (Optionnel)

Après reconnexion, dans la console, tapez :

```javascript
localStorage.getItem('authToken')
```

Vous devriez voir un long token commençant par `"eyJ..."` → Token frais ✅

## ⏰ Durée de Validité

Les tokens JWT expirent après **24 heures**. Si vous voyez à nouveau des 401 demain, refaites simplement ces 3 étapes.

## 💡 Alternative Rapide

Au lieu de `localStorage.clear()`, vous pouvez aussi :
- Chercher le bouton **"Déconnexion"** dans le backoffice
- Cliquer dessus
- Se reconnecter normalement

Les deux méthodes fonctionnent ! 🚀

---

**Créé le:** 23 février 2026  
**Système:** TRU Group - Système de Formations
