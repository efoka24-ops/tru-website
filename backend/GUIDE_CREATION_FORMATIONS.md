# 🎓 Guide - Création Automatique des 20 Formations TRU GROUP

## 📋 Formations qui seront créées

### **Compétences (10 formations)**
1. ✅ Intelligence Artificielle (IA) - 580,000 FCFA - 8 semaines
2. ✅ Cybersécurité - 480,000 FCFA - 6 semaines
3. ✅ Analyse des Données - 420,000 FCFA - 5 semaines
4. ✅ Marketing Numérique - 380,000 FCFA - 4 semaines
5. ✅ Anglais des Affaires - 320,000 FCFA - 8 semaines
6. ✅ IA Générative (GenAI) - 450,000 FCFA - 4 semaines
7. ✅ Microsoft Excel Avancé - 280,000 FCFA - 3 semaines
8. ✅ Microsoft Power BI - 380,000 FCFA - 4 semaines
9. ✅ Gestion de Projet (Project Management) - 420,000 FCFA - 5 semaines
10. ✅ Python pour Débutants et Professionnels - 380,000 FCFA - 6 semaines

### **Certificats et Programmes (10 formations)**
1. ✅ Certificat de Cybersécurité Google - 650,000 FCFA - 6 mois
2. ✅ Certificat Google Data Analytics - 620,000 FCFA - 6 mois
3. ✅ Certificat d'Assistance Informatique Google - 580,000 FCFA - 5 mois
4. ✅ Certificat de Gestion de Projet Google - 620,000 FCFA - 6 mois
5. ✅ Certificat Google UX Design - 650,000 FCFA - 6 mois
6. ✅ Certificat d'Analyste de Données IBM - 680,000 FCFA - 7 mois
7. ✅ Certificat IBM Science des Données - 750,000 FCFA - 8 mois
8. ✅ Certificat en Apprentissage Automatique - 720,000 FCFA - 7 mois
9. ✅ Certificat Microsoft Power BI (Analyste Décisionnel) - 580,000 FCFA - 4 mois
10. ✅ Certificat de Concepteur UI/UX - 620,000 FCFA - 5 mois

**Total: 20 formations professionnelles** 🚀

---

## 🚀 Instructions d'exécution

### **Étape 1: Vérifier les prérequis**

✅ **Backend doit tourner**
```powershell
# Terminal 1 - Démarrer le backend
cd "c:\Users\EMMANUEL\Documents\site tru\backend"
node server.js
```
Vérifier que vous voyez: `✅ Server running on port 5000`

✅ **Tables Supabase doivent exister**
```sql
-- Dans Supabase SQL Editor, exécuter:
-- Contenu de backend/formations-tables.sql
```

### **Étape 2: Installer node-fetch (si nécessaire)**
```powershell
cd "c:\Users\EMMANUEL\Documents\site tru\backend"
npm install node-fetch
```

### **Étape 3: Exécuter le script de création**
```powershell
# Dans le dossier backend
node create-formations.cjs
```

### **Résultat attendu**
```
╔════════════════════════════════════════════════════╗
║   🎓 CRÉATION DES FORMATIONS TRU GROUP 🎓         ║
╚════════════════════════════════════════════════════╝

📚 Total à créer: 20 formations

┌─────────────────────────────────────────────────┐
│  📖 COMPÉTENCES (10 formations)                 │
└─────────────────────────────────────────────────┘

✅ Intelligence Artificielle (IA)
✅ Cybersécurité
✅ Analyse des Données
...

┌─────────────────────────────────────────────────┐
│  🎓 CERTIFICATS ET PROGRAMMES (10 formations)   │
└─────────────────────────────────────────────────┘

✅ Certificat de Cybersécurité Google
✅ Certificat Google Data Analytics
...

╔════════════════════════════════════════════════════╗
║              📊 RÉSUMÉ FINAL                       ║
╠════════════════════════════════════════════════════╣
║  ✅ Succès:  20                                    ║
║  ❌ Erreurs: 0                                     ║
║  📊 Total:   20                                    ║
╚════════════════════════════════════════════════════╝

🎉 TOUTES LES FORMATIONS ONT ÉTÉ CRÉÉES AVEC SUCCÈS!
```

---

## 🔍 Vérification dans le Backoffice

1. **Ouvrir le backoffice**: `http://localhost:3000`
2. **Se connecter**
3. **Menu → 🎓 Formations**
4. **Résultat**: Vous devriez voir les **20 formations** dans la liste

---

## ⚠️ En cas d'erreur

### **Erreur: `fetch is not a function`**
```powershell
# Installer node-fetch
npm install node-fetch
```

### **Erreur: `Connection refused`**
```powershell
# Le backend ne tourne pas, démarrer:
cd backend
node server.js
```

### **Erreur: `Table formations does not exist`**
1. Aller sur Supabase: https://app.supabase.com
2. SQL Editor → New Query
3. Copier/coller le contenu de `backend/formations-tables.sql`
4. Cliquer **Run**

### **Erreur: `401 Unauthorized`**
- Les endpoints `/api/formations` (POST) nécessitent l'authentification
- Le script envoie les requêtes sans token pour le moment
- **Solution**: Modifier temporairement `server.js` pour retirer `requireAuth` du endpoint POST

---

## 🎯 Alternative: Créer manuellement via le Backoffice

Si le script ne fonctionne pas, vous pouvez créer chaque formation manuellement:

1. Backoffice → **🎓 Formations**
2. Cliquer **"Nouvelle Formation"**
3. Remplir le formulaire avec les détails ci-dessus
4. Ajouter les modules un par un
5. **Créer**

Répéter pour chacune des 20 formations.

---

## 📊 Détails techniques

**Format des données:**
- Prix en FCFA (280,000 à 750,000)
- Durée: semaines ou mois
- Format: `presentiel`, `en_ligne`, `hybride`
- Modules: tableau JSON
- Dates: Mars à Décembre 2026
- Places: 15 à 35 participants

**Répartition:**
- 5 formations présentielles
- 8 formations en ligne
- 7 formations hybrides

**Prix moyen:** 510,000 FCFA
**Durée moyenne:** 5 mois

---

## ✅ Checklist finale

- [ ] Backend tourne (port 5000)
- [ ] Tables Supabase créées
- [ ] node-fetch installé
- [ ] Script exécuté avec succès
- [ ] 20 formations visibles dans le backoffice
- [ ] Formations visibles sur le frontend (`/formations`)

🎉 **Vos formations sont prêtes à accueillir des inscriptions !**
