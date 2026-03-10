# 📧 Tutoriel Rapide - Gestion des Contacts

## ✨ En 3 minutes

### Étape 1: Accéder à la section Gestion des Contacts
1. Ouvrir le backoffice: **https://bo.trugroup.cm**
2. Se connecter avec les identifiants d'admin
3. Cliquer sur **"Gestion des Contacts"** dans le menu principal

### Étape 2: Visualiser les messages en attente
- L'interface affiche tous les messages reçus du formulaire de contact
- Les messages sont triés par défaut par date (les plus récents en premier)
- Filtres disponibles en haut:
  - **📋 Tous** - Tous les messages
  - **⏳ En attente** - Nécessitent une réponse
  - **✅ Répondus** - Déjà traités
  - **🔒 Fermés** - Archivés

### Étape 3: Répondre à un message

#### Option A: Répondre sans marquer comme "répondu"
1. Cliquer sur **"Voir + Répondre"**
2. Lire le message original
3. Choisir la méthode de réponse:
   - **📧 Email** - Envoyer par email
   - **💬 SMS** - Envoyer par SMS
4. Écrire la réponse dans la textarea
5. Cliquer **"Envoyer"**

#### Option B: Marquer comme "répondu" rapide
- Cliquer le bouton **"✅ Répondu"** pour marquer sans ajouter de message
- Utile si la réponse a été envoyée en dehors du système

### Étape 4: Gérer les messages
- **Supprimer** un message: Cliquer l'icone 🗑️ (à droite)
- **Revoir** une réponse: Cliquer "Voir + Répondre" sur un message déjà répondu
- **Archiver** en changeant le statut à "Fermé"

---

## 📋 Checklist de traitement

À chaque nouveau message en attente:

- [ ] Lire le message complet
- [ ] Déterminer si c'est une consultation, devis, support, etc.
- [ ] Préparer la réponse appropriée
- [ ] Choisir email ou SMS (email = plus formel, SMS = plus rapide)
- [ ] Envoyer la réponse
- [ ] Vérifier que le statut passe à "✅ Répondu"
- [ ] Archiver ou fermer si nécessaire

---

## 💡 Conseils d'utilisation

### Pour les Emails
- Plus professionnel et formel
- Idéal pour les demandes de devis et consultations
- Garder une trace écrite complète
- Template standard: "Merci pour votre message. Nous traiterons votre demande et vous répondrons sous 24h."

### Pour les SMS
- Plus personnel et rapide
- Idéal pour les confirmations et suivis simples
- Pas de pièces jointes possibles
- Garder les messages courts et clairs

---

## ⚠️ Important

### Automatisation
- Les messages du frontend sont automatiquement sauvegardés en base
- **Pas d'intervention manuelle nécessaire** pour la réception
- Vous recevrez les messages en temps réel dans le backoffice

### Sécurité
- Tous les messages sont stockés de manière sécurisée
- Les réponses sont archivées avec timestamp
- Historique complet disponible

### Performance
- Cache de 30 secondes sur la liste des contacts
- Optimisé pour les appareils mobiles
- Chargement rapide même avec beaucoup de messages

---

## 🔧 Troubleshooting rapide

| Problème | Solution |
|----------|----------|
| Les messages n'apparaissent pas | Rafraîchir la page (F5) ou attendre 30s |
| Les emails ne s'envoient pas | Vérifier la configuration EmailJS |
| La pagination est lente | Moins de 50 messages simultanés recommandé |
| Message non répondus manquants | Vérifier le filtre (devrait être sur "En attente") |

---

## 📞 Support

En cas de problème:
1. Vérifier que le backend est en ligne: `https://tru-backend-o1zc.onrender.com/api/contacts`
2. Vérifier la console du navigateur (F12) pour les erreurs
3. Contacter: **efoka24@gmail.com**

---

## 📊 Statistiques utiles

L'interface affiche automatiquement:
- Nombre total de messages reçus
- Nombre de messages en attente
- Nombre de messages répondus
- État de synchronisation en temps réel

Pour une analyse plus approfondie, consulter les logs du backend.

---

## 🎯 Workflow complet

```
Client ─→ Remplit formulaire → Envoie (frontend)
                ↓
            Backend reçoit
                ↓
            Sauvegarde en DB
                ↓
      Notification dans le backoffice
                ↓
         Admin voir le message
                ↓
        Admin clique "Répondre"
                ↓
       Admin écrit une réponse
                ↓
           Email/SMS envoyé
                ↓
           Status = "Répondu"
                ↓
           Client reçoit réponse
```

---

## 🚀 Améliorations disponibles

Futures fonctionnalités à venir:
- [ ] Templates de réponses prédéfinies
- [ ] Assignation de contacts à des membres
- [ ] Notifications en temps réel
- [ ] Export CSV/PDF
- [ ] Historique d'interactions complet
- [ ] Intégration CRM

---

**Dernière mise à jour**: Janvier 2026
**Version**: 1.0
**Statut**: Stable et en production ✅
