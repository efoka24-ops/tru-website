# 🎯 Guide: Ajouter/Modifier un Membre de l'Équipe

## ✅ Étapes pour ajouter un membre et le rendre visible sur le site

### 1️⃣ **Accéder au formulaire**
   - Ouvrir le Backoffice: `http://localhost:3001`
   - Cliquer sur **"Équipe"** dans le menu latéral
   - Cliquer sur le bouton **"➕ Ajouter un membre"**

### 2️⃣ **Remplir les informations obligatoires**

   ✅ **Nom complet** (Obligatoire)
   - Exemple: `Emmanuel Foka Ziegoube`

   ✅ **Fonction/Titre** (Obligatoire)
   - Exemple: `Fondateur & PDG`

   ✅ **Description (Bio)**
   - Courte biographie du membre
   - Exemple: `Ingénieur en génie logiciel | Expert en transformation digitale`

### 3️⃣ **Ajouter une photo**

   📸 **Comment uploader?**
   1. Cliquer sur le bouton **"Uploader une photo"**
   2. Sélectionner une image depuis votre ordinateur
   3. L'image s'affichera en aperçu
   4. La photo sera sauvegardée lors du clic sur **"Enregistrer"**

   ✅ **Formats acceptés**: JPG, PNG, GIF, WebP

### 4️⃣ **Ajouter les coordonnées**

   📧 **Email** (Optionnel)
   - Exemple: `emmanuel@trugroup.cm`

   📞 **Téléphone** (Optionnel)
   - Exemple: `+237 691 22 71 49`

   💼 **LinkedIn** (Optionnel)
   - Lien complet vers le profil LinkedIn

### 5️⃣ **Ajouter les spécialités**

   🎯 **Comment faire?**
   1. Saisir une spécialité dans le champ
   2. Appuyer sur **Entrée** ou cliquer le bouton **"+"**
   3. La spécialité apparaîtra en badge
   4. Pour supprimer: cliquer sur le **"X"** du badge

   ✅ **Exemples**: Stratégie, Innovation, Leadership, Cloud, DevOps, etc.

### 6️⃣ **Ajouter des réalisations (Optionnel)**

   🏆 **Même procédé que les spécialités**
   - Saisir une réalisation
   - Appuyer sur **Entrée**
   - Elle s'affichera en badge bleu

   ✅ **Exemples**: 10 ans d'expérience, Prix innovation 2024, etc.

### 7️⃣ **Configurer le statut**

   ⭐ **Fondateur?**
   - Cocher si le membre est fondateur

   👁️ **Visible?**
   - Cocher si le membre doit apparaître sur le site public

### 8️⃣ **Enregistrer et publier**

   💾 **Cliquer sur "Enregistrer"**
   - Le membre sera immédiatement sauvegardé dans le Backend
   - Les données seront synchronisées avec le site public
   - Un message de confirmation s'affichera ✅

---

## 🔄 **Modifier un membre existant**

### Étapes:
1. Aller sur **"Équipe"**
2. Cliquer sur l'**icône "✏️ Modifier"** sur la carte du membre
3. Modifier les champs souhaités
4. Cliquer sur **"Enregistrer"**

---

## 🗑️ **Supprimer un membre**

### Étapes:
1. Aller sur **"Équipe"**
2. Cliquer sur l'**icône "🗑️ Supprimer"** sur la carte
3. Confirmer la suppression dans la fenêtre de dialogue
4. Le membre sera retiré du site

---

## 📊 **Vérifier la synchronisation**

### Voir les données sur le site public:
1. Aller sur: `http://localhost:3000/team`
2. Les 5 membres doivent s'afficher
3. Les changements apparaissent automatiquement après ~30 secondes

### Voir le Backend:
- API: `http://localhost:5000/api/team`
- Retourne JSON avec tous les membres

---

## ⚠️ **Résolution des erreurs**

### ✅ Erreur: "Le nom est obligatoire"
- Vérifier que le champ **Nom complet** est rempli

### ✅ Erreur: "La fonction est obligatoire"
- Vérifier que le champ **Fonction/Titre** est rempli

### ✅ Les données ne s'affichent pas sur le site
1. Vérifier que le Backend est démarré (port 5000)
2. Attendre 30 secondes pour la synchronisation
3. Rafraîchir la page: **F5**

### ✅ Photo ne s'affiche pas
1. Vérifier que l'image a été chargée correctement
2. Essayer avec une image plus petite (<2MB)
3. S'assurer que le format est JPG, PNG ou GIF

---

## 🎯 **Résumé rapide**

| Action | Étapes |
|--------|--------|
| **Ajouter** | Équipe → ➕ → Remplir → Enregistrer |
| **Modifier** | Équipe → ✏️ → Modifier → Enregistrer |
| **Supprimer** | Équipe → 🗑️ → Confirmer |
| **Voir sur site** | `http://localhost:3000/team` |

---

## 📱 **Exemple complet**

**Données saisies:**
- Nom: `Marie Tagne`
- Titre: `Lead Developer Mobile`
- Bio: `Développeuse mobile spécialisée en React Native`
- Photo: `marie.jpg`
- Email: `marie@trugroup.cm`
- Spécialités: Mobile, React Native, UX
- Réalisations: 5 ans d'expérience, 10+ applications publiées

**Résultat:**
✅ Marie apparaît sur: `http://localhost:3000/team` avec toutes les infos
✅ Données synchronisées au Backend: `http://localhost:5000/api/team`
✅ Visible dans le Backoffice: `http://localhost:3001/sync`

---

Bon travail! 🚀
