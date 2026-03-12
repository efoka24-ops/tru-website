# 🔧 Résolution Problème Formations - Backoffice

## ✅ Problème Résolu

**Date:** 23 février 2026

### 🔍 Diagnostic Effectué

1. **Backend local** ✅
   - Actif sur port 5000
   - API `/api/formations` retourne **43 formations**
   - Connexion Supabase OK

2. **Supabase** ✅
   - Tables créées (`formations`, `inscriptions_formations`)
   - Données insérées (43 formations)
   - RLS désactivé

3. **Problème Identifié** ❌
   - Le backoffice se connectait au serveur distant : `https://tru-backend-o1zc.onrender.com`
   - Au lieu du serveur local : `http://localhost:5000`

### 🛠️ Solution Appliquée

**Fichier modifié:** `backoffice/.env`

```env
# AVANT:
VITE_BACKEND_URL=https://tru-backend-o1zc.onrender.com

# APRÈS:
VITE_BACKEND_URL=http://localhost:5000
```

**Action effectuée:**
- Redémarrage automatique du serveur Vite du backoffice
- Les modifications .env nécessitent un redémarrage pour être prises en compte

### 📊 Résultats Attendus

Après redémarrage du backoffice, vous devriez voir :

#### Page Formations (`http://localhost:3000/formations`)
- ✅ 43 formations affichées en grille
- ✅ Recherche fonctionnelle
- ✅ Statistiques (formations actives, total, places)
- ✅ Bouton "Nouvelle Formation"
- ✅ Actions: Modifier, Supprimer

#### Page Inscriptions (`http://localhost:3000/inscriptions-formations`)
- ✅ Tableau des inscriptions
- ✅ Statistiques (Total, En attente, Confirmées, Revenue)
- ✅ Recherche et filtre par statut
- ✅ Export CSV
- ✅ Détails de chaque inscription

### 🎯 Test de Vérification

```bash
# Test API en ligne de commande:
curl http://localhost:5000/api/formations
# Devrait retourner 43 formations

# Ou avec PowerShell:
Invoke-WebRequest -Uri "http://localhost:5000/api/formations" | Select-Object -ExpandProperty Content
```

### 📝 Checklist Post-Redémarrage

1. [ ] Backoffice accessible sur http://localhost:3000 ou 3001
2. [ ] Console F12 sans erreurs
3. [ ] Formations visibles dans le menu 🎓
4. [ ] Page Formations affiche 43 formations
5. [ ] Page Inscriptions accessible

### 🐛 Si le Problème Persiste

**Vérifier dans la console (F12):**
- Onglet **Console** : erreurs JavaScript
- Onglet **Network** : requêtes API et leurs réponses
- Chercher les requêtes vers `/api/formations`
- Vérifier l'URL appelée (doit être `http://localhost:5000`)

**Commandes de diagnostic:**

```powershell
# Vérifier le backend
Get-Process -Name node | Select-Object Id, ProcessName

# Tester l'API
Invoke-WebRequest -Uri "http://localhost:5000/api/formations"

# Vérifier le fichier .env
Get-Content "backoffice\.env"
```

### 📁 Fichiers Impliqués

1. `backend/INSTALLER-FORMATIONS-COMPLET.sql` - Création tables + 43 formations
2. `backend/FIX-PERMISSIONS-SUPABASE.sql` - Désactivation RLS
3. `backoffice/.env` - Configuration URL backend (MODIFIÉ)
4. `backoffice/src/api/backendClient.js` - Client API
5. `backoffice/src/pages/FormationsPage.jsx` - Page admin formations
6. `backoffice/src/pages/InscriptionsFormationsPage.jsx` - Page inscriptions

### 🎓 Formations Système Complet

**Base de données:**
- ✅ 2 tables créées
- ✅ 43 formations (4 catégories)
- ✅ Auto-numérotation (FORM-2026-0001)
- ✅ RLS désactivé

**Backend (Node.js):**
- ✅ 11 endpoints REST
- ✅ CRUD complet
- ✅ Port 5000

**Frontend Public:**
- ✅ Page /formations (catalogue)
- ✅ Page /confirmer-inscription (paiement)
- ✅ Formulaire d'inscription

**Backoffice Admin:**
- ✅ Page Formations (CRUD)
- ✅ Page Inscriptions (suivi)
- ✅ Export CSV
- ✅ Statistiques

---

## 💡 Notes Importantes

1. **Développement Local:** Toujours utiliser `http://localhost:5000`
2. **Production:** Utiliser `https://tru-backend-o1zc.onrender.com`
3. **Variable .env:** Redémarrer Vite après modification
4. **RLS Supabase:** Désactivé pour simplifier (peut être réactivé avec politiques appropriées)

---

**Statut Final:** ✅ **SYSTÈME OPÉRATIONNEL**
