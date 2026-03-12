# 🎯 PROCHAINES ÉTAPES - Configuration Supabase

## ✅ Ce qui est déjà fait:

1. ✅ Projet Supabase créé: `tru-groupbd`
2. ✅ Identifiants configurés dans `.env`
3. ✅ Script SQL prêt: `backend/supabase-schema.sql`

---

## 📝 ÉTAPE 1: Créer les Tables (5 min)

### Via Supabase Dashboard:

```
1. Aller sur https://supabase.com/dashboard
2. Sélectionner le projet "tru-groupbd"
3. Cliquer sur "SQL Editor" dans la barre latérale gauche
4. Cliquer sur "New Query"
5. Ouvrir le fichier: backend/supabase-schema.sql
6. Copier TOUT le contenu
7. Coller dans SQL Editor
8. Cliquer "Run" (ou Ctrl+Enter)
9. Attendre "Success. No rows returned"
```

### Vérifier les tables:

```
1. Cliquer sur "Table Editor" dans la barre latérale
2. Vous devriez voir 6 tables:
   - services
   - solutions
   - team
   - contacts
   - users
   - settings
```

---

## 📦 ÉTAPE 2: Installer les Packages (2 min)

### Dans le terminal "node" (déjà ouvert dans backend):

```powershell
# Vérifier qu'on est dans backend
pwd
# Devrait afficher: C:\Users\EMMANUEL\Documents\site tru\backend

# Installer Supabase client
npm install

# Vérifier l'installation
npm list @supabase/supabase-js
```

---

## 🔄 ÉTAPE 3: Migrer les Données (3 min)

### Lancer le script de migration:

```powershell
# Dans le terminal backend
npm run migrate:supabase
```

### Output attendu:

```
🚀 Démarrage Migration Supabase
========================================
🔗 Test connexion Supabase...
✅ Connexion réussie

📂 Lecture data.json...
✅ 4 collections trouvées

💾 Création backup...
✅ Backup créé: backend/data-backup-2026-02-19T...json

📦 Migration Services...
✅ 6 services migrés (0 erreurs)

📦 Migration Solutions...
✅ 8 solutions migrées (0 erreurs)

📦 Migration Team...
✅ 12 membres migrés (0 erreurs)

📦 Migration Contacts...
✅ 3 contacts migrés (0 erreurs)

🔍 Vérification de la migration...
📊 Résumé:
   • Services: 6
   • Solutions: 8
   • Team: 12
   • Contacts: 3

✅ Migration terminée avec succès!
```

### Vérifier dans Supabase Dashboard:

```
1. Table Editor → services → Voir les 6 services
2. Table Editor → team → Voir les 12 membres
3. Table Editor → solutions → Voir les 8 solutions
4. Table Editor → contacts → Voir les messages
```

---

## ⚠️ SI ERREURS

### Erreur: "Table does not exist"

```
→ Retourner à l'ÉTAPE 1
→ Exécuter le SQL dans Supabase SQL Editor
→ Vérifier que les 6 tables sont créées
```

### Erreur: "Invalid API key"

```
→ Vérifier backend/.env
→ SUPABASE_URL doit être: https://lupnscaeituljcddaagk.supabase.co
→ SUPABASE_KEY doit commencer par: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Erreur: "data.json not found"

```
→ Vérifier que backend/data.json existe
→ Sinon copier depuis data.example.json
```

---

## ✅ APRÈS LA MIGRATION

Une fois que la migration est réussie, dites-moi et je vais:

1. Mettre à jour `server.js` pour utiliser Supabase
2. Mettre à jour toutes les routes API
3. Tester les endpoints
4. Créer le script de déploiement Render

---

**Status actuel:** 
- ✅ Configuration Supabase complète
- ⏳ En attente: Créer tables + Migrer données

**Prochaine commande à exécuter:**
```powershell
npm run migrate:supabase
```
