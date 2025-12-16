# 🎯 GUIDE D'UTILISATION - Portail Membre Professionnel

## ✨ Ce qui a été créé

Un **système complet de gestion des profils professionnels** pour votre équipe:

### Pour les **Membres**:
✅ Se connecter avec email professionnel  
✅ Gérer leur profil personnel  
✅ Uploader une photo  
✅ Ajouter des expertises et certifications  
✅ Changer leur mot de passe  

### Pour les **Administrateurs**:
✅ Créer des comptes pour les membres  
✅ Générer des codes de connexion uniques  
✅ Modifier les rôles et permissions  
✅ Activer/Désactiver les comptes  
✅ Réinitialiser les codes  

---

## 🚀 DÉMARRER IMMÉDIATEMENT

### ÉTAPE 1: Admin Crée un Compte pour un Membre

**Allez sur:** `https://votre-site.com/admin`

1. Connectez-vous en tant qu'admin
2. Cliquez sur l'onglet **"Accès Membres"** (nouvelle section)
3. Trouvez un membre dans la liste
4. Cliquez sur **"Create"** (bouton vert)
5. Remplissez:
   - 📧 **Email:** `member@company.com`
   - 🔐 **Mot de passe initial:** (optionnel)
   - 👤 **Rôle:** Choisissez `member` ou `admin`
6. Cliquez **"Create Account"**
7. ✅ Un **code de connexion** est généré automatiquement

**Exemple de code:** `ABC123DEF456`

---

### ÉTAPE 2: Membre Se Connecte pour la Première Fois

**Allez sur:** `https://votre-site.com/member/login`

1. Sélectionnez l'onglet **"Login Code"**
2. Entrez:
   - 📝 Code: `ABC123DEF456`
   - 🔐 Nouveau mot de passe: (créez-en un)
   - 🔐 Confirmez le mot de passe
3. Cliquez **"Sign In"**
4. ✅ Vous êtes connecté! Redirigé vers le dashboard

---

### ÉTAPE 3: Membre Modifie Son Profil

**Page:** `https://votre-site.com/member/dashboard`

1. Cliquez sur **"Edit"** (bouton bleu)
2. Modifiez vos informations:
   - 📸 **Photo:** Cliquez l'appareil photo
   - 📝 **Nom Complet:** Mettez à jour
   - 💼 **Poste:** Titre professionnel
   - 📋 **Bio:** Description personnelle
   - 📞 **Téléphone:** +237...
   - 🔗 **LinkedIn:** Lien profil
   - 🎯 **Expertises:** Ajoutez vos compétences
   - 🏆 **Certifications:** Diplômes/Awards
3. Cliquez **"Save"**
4. ✅ Changements sauvegardés!

---

## 📱 INTERFACES

### 🔐 Page de Connexion Membre
**URL:** `/member/login`

2 modes:
- **Email & Mot de passe** (pour reconnexion)
- **Login Code** (première fois)

### 👤 Profil Membre
**URL:** `/member/dashboard` ou `/member/profile`

- Vue et édition du profil
- Upload de photo
- Gestion des expertises
- Gestion des certifications
- Déconnexion

### 🔧 Gestion Admin
**URL:** `/admin` → onglet "Accès Membres"

- Liste des membres + statut du compte
- Créer des comptes
- Générer des codes
- Modifier email/rôle/statut
- Supprimer des comptes

---

## 🎯 CAS D'UTILISATION

### Scénario 1: Nouvel Employé

```
Admin:
1. Va à /admin → Accès Membres
2. Trouve "Jean Kameni"
3. Clique Create
4. Email: jean.kameni@company.com
5. Rôle: member
6. Code généré: XYZ789ABC123

Envoi au nouvel employé:
→ "Bienvenue! Votre code: XYZ789ABC123"
→ "Allez sur: company.com/member/login?code=XYZ789ABC123"

Nouvel employé:
1. Visite le lien
2. Code pré-rempli ✓
3. Crée un mot de passe
4. Modifie son profil
5. ✓ Connecté!
```

### Scénario 2: Membre Oublie Son Mot de Passe

```
Membre:
→ "J'ai oublié mon mot de passe"

Admin:
1. Va à /admin → Accès Membres
2. Trouve le membre
3. Clique bouton ↻ (Regenerate Code)
4. Nouveau code généré
5. L'envoie au membre

Membre:
1. Reçoit le nouveau code
2. Va à /member/login
3. Sélectionne "Login Code"
4. Rentre le code + nouveau mot de passe
5. ✓ Reconnecté!
```

### Scénario 3: Modificaton de Rôle

```
Un membre doit devenir Admin:

Admin:
1. Va à /admin → Accès Membres
2. Cherche le membre
3. Clique Edit (stylo)
4. Change: Rôle de "member" → "admin"
5. Clique Save
6. ✓ Accès admin octroyé!
```

---

## 🔐 SÉCURITÉ

**Codes de Connexion:**
- 🔒 12 caractères aléatoires
- ⏰ Expirent après 24 heures
- ✋ Usage unique (se transforme en mot de passe)
- 📧 À envoyer de manière sécurisée

**Mots de Passe:**
- 🔐 Minimum 6 caractères
- 💪 Hachés avec PBKDF2
- 🚫 Jamais envoyés par email
- 🔄 Peut être changé anytime

**Tokens JWT:**
- 🎫 Valides 24 heures
- 💾 Stockés localement
- 🔓 Déconnexion = suppression

---

## 📧 INTÉGRATION EMAIL (Optionnel)

Pour **envoyer automatiquement** les codes par email:

**Option 1: SendGrid**
```javascript
// Dans backend/server.js
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email,
  from: 'noreply@company.com',
  subject: 'Votre code d\'accès TRU',
  html: `<h2>Bienvenue!</h2><p>Code: <strong>${loginCode}</strong></p>`
});
```

**Option 2: Nodemailer**
```javascript
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({...});

await transporter.sendMail({
  to: email,
  subject: 'Votre code d\'accès',
  html: `Code: ${loginCode}`
});
```

---

## 🌐 ROUTES DE L'APPLICATION

### Site Web (Membre)
- `/member/login` - Page connexion
- `/member/dashboard` - Mon profil
- `/member/profile` - Éditer profil

### Backoffice (Admin)
- `/admin` - Dashboard complet
- `/admin` → onglet "Accès Membres" - Gestion des comptes

### API Backend
- `POST /api/auth/login` - Connexion
- `POST /api/auth/login-code` - Connexion avec code
- `GET /api/members/:id/profile` - Récupérer profil
- `PUT /api/members/:id/profile` - Modifier profil
- `PUT /api/members/:id/photo` - Uploader photo
- `GET /api/admin/members` - Lister tous
- `POST /api/admin/members/:id/account` - Créer compte
- `POST /api/admin/members/:id/login-code` - Nouveau code

---

## ✅ CHECKLIST RAPIDE

- [ ] Admin connecté à `/admin`
- [ ] Créer un compte de test
- [ ] Code généré
- [ ] Membre se connecte avec code
- [ ] Modifier profil fonctionne
- [ ] Upload photo fonctionne
- [ ] Admin modifie le rôle
- [ ] Générer un nouveau code fonctionne
- [ ] Déconnexion fonctionne
- [ ] Reconnexion avec email + mot de passe fonctionne

---

## 🆘 DÉPANNAGE RAPIDE

| Problème | Solution |
|----------|----------|
| "Token invalide" | Reconnectez-vous, token expire après 24h |
| "Code expiré" | Admin doit générer un nouveau code (bouton ↻) |
| "Email déjà utilisé" | Utilisez un email différent |
| "Photo trop grande" | Max 5MB, compressez l'image |
| "Profil ne se sauvegarde pas" | Vérifiez la connexion au backend |
| "Membre n'a pas de compte" | Admin doit d'abord créer le compte |

---

## 📊 DONNÉES IMPORTANTE

Tous les comptes sont stockés dans **`backend/data.json`**:

```json
{
  "team": [
    {
      "id": 2,
      "name": "Halimatou Sadia Ahmadou",
      "email": "bob@sitetru.com",
      ...
    }
  ],
  "memberAccounts": [
    {
      "id": 2,
      "memberId": 2,
      "email": "bob@sitetru.com",
      "passwordHash": "...",
      "role": "member",
      "status": "active",
      "loginCode": "ABC123DEF456",
      "lastLogin": "2025-01-16T10:30:00Z"
    }
  ]
}
```

---

## 🎓 FORMATION ÉQUIPE

### Pour les Administrateurs (15 min)

1. Accéder à `/admin`
2. Comprendre l'onglet "Accès Membres"
3. Créer un compte (2 min)
4. Générer un code (1 min)
5. Tester la connexion

### Pour les Membres (10 min)

1. Recevoir le code par email/SMS
2. Aller sur `/member/login`
3. Se connecter avec le code
4. Créer un mot de passe
5. Remplir le profil

---

## 📞 SUPPORT TECHNIQUE

### Questions Fréquentes

**Q: Où va ma photo?**
A: Convertie en base64 et stockée dans `backend/data.json`. Pour la prod, utilisez un service cloud (Cloudinary, S3).

**Q: Puis-je avoir 2 comptes?**
A: Non, un email = un compte. Pour un 2e compte, utilisez un email différent.

**Q: Comment exporter les données?**
A: Les données sont dans `backend/data.json`. Vous pouvez les télécharger ou exporter en CSV.

**Q: Quelle est la taille max du mot de passe?**
A: Pas de limite, minimum 6 caractères.

**Q: Puis-je customiser la durée du token?**
A: Oui, dans `backend/utils/passwordUtils.js`, changez `'24h'` à `'48h'` etc.

---

## 🚀 PROCHAINES ÉTAPES

1. **Tester** - Créer quelques comptes de test
2. **Personnaliser** - Modifier les couleurs, textes
3. **Intégrer Email** - Envoyer les codes automatiquement
4. **Déployer** - Mettre en ligne (Vercel/Render)
5. **Documenter** - Créer un manuel pour l'équipe

---

## 📞 Besoin d'Aide?

- 📚 Voir: `MEMBER_PORTAL_ARCHITECTURE.md` (détails techniques)
- 📖 Voir: `MEMBER_PORTAL_GUIDE.md` (guide complet)
- 💻 Code source: Tous les fichiers commentés
- 🔗 API Docs: Endpoints documentés dans le code

---

**Version:** 1.0  
**Date:** 16 Janvier 2025  
**Status:** ✅ PRÊT POUR UTILISATION  

Bon courage! 🚀
