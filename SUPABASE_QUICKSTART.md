# 🎯 QUICK START - Supabase en 10 minutes

Pour commencer immédiatement avec Supabase:

## 1️⃣ Créer compte (2 min)
```bash
# Aller sur https://supabase.com
# Sign up → New Project
# Name: tru-group
# Password: [générer]
# Region: Europe West
# Attendre 2-3 minutes
```

## 2️⃣ Récupérer les clés (1 min)
```bash
# Settings → API
# Copier:
# - Project URL
# - anon/public key
```

## 3️⃣ Configurer localement (1 min)
```bash
cd backend

# Créer .env
cp .env.example .env

# Éditer .env et ajouter:
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4️⃣ Créer les tables (2 min)
```bash
# Dans Supabase Dashboard:
# SQL Editor → New Query
# Copier le SQL depuis SUPABASE_SETUP_GUIDE.md section "ÉTAPE 3"
# Run (Ctrl+Enter)
```

## 5️⃣ Installer et migrer (3 min)
```bash
# Installer package
npm install

# Migrer données
npm run migrate:supabase
```

## 6️⃣ Tester (1 min)
```bash
# Démarrer serveur
npm start

# Dans autre terminal
curl http://localhost:5000/api/health/db
curl http://localhost:5000/api/services
```

## ✅ C'est tout!

Votre backend utilise maintenant Supabase.

**Voir le guide complet:** [SUPABASE_SETUP_GUIDE.md](SUPABASE_SETUP_GUIDE.md)

**Prochaines étapes:**
1. Mettre à jour server.js avec les routes Supabase
2. Tester tous les endpoints
3. Déployer sur Render avec SUPABASE_URL et SUPABASE_KEY

---

**Avantages Supabase:**
- ✅ 500 MB gratuit
- ✅ Backup automatique
- ✅ Dashboard admin
- ✅ Realtime intégré
- ✅ API auto-générée
- ✅ Pas de carte bancaire
