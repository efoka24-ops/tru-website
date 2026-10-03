# Version PHP 8.1 - TRU GROUP

Site prêt pour un hébergement mutualisé PHP 8.1 (sans Node.js), avec back-office
de gestion de contenu et notifications WhatsApp.

## Contenu
- `index.php` + routing par `?page=`
- Pages publiques : Accueil, À propos, Services, Solutions, Équipe, Formations,
  Actualités, Carrières (avec formulaire de candidature), Contact
- Back-office CRUD sous `gestion-647a0f15/` (URL volontairement non devinable,
  aucun lien public n'y pointe)
- Formulaires stockés en MySQL : messages de contact, candidatures (avec upload
  de CV en PDF)
- Notification WhatsApp (wapi.mana.cm) à chaque nouveau message / candidature

## Installation
1. Importer `database.sql` dans phpMyAdmin (base `trugro9159_tru`) — crée toutes
   les tables (contenu, admin, candidatures...).
2. Vérifier les identifiants DB dans `includes/config.php`.
3. Uploader tout le contenu de `php81/` dans `/home/trugro9159/public_html/` via FTP.
4. Ouvrir `https://trugroup.cm/gestion-647a0f15/setup_admin.php` **une seule fois**
   pour créer votre compte administrateur (identifiant + mot de passe). Cette page
   se désactive automatiquement dès qu'un compte existe.
5. Se connecter sur `https://trugroup.cm/gestion-647a0f15/login.php`.

## Migrations de contenu
Pour ajouter du contenu à une base déjà en production (ex. un nouveau service),
ajoutez une entrée dans `content_run_migrations()` (`includes/content.php`).
Elle s'exécute automatiquement une seule fois au prochain chargement d'une page
(suivi dans la table `content_migrations`, créée automatiquement) : aucun import
SQL manuel n'est nécessaire.

## WhatsApp (wapi.mana.cm)
Dans `includes/config.php`, renseigner :
- `WAPI_API_KEY` : votre clé API si `API_KEY` est définie côté wapi
- `WAPI_NOTIFY_NUMBER` : le numéro (format `237XXXXXXXXX`) qui doit recevoir les
  notifications de nouvelles candidatures et nouveaux messages de contact

Tant que `WAPI_NOTIFY_NUMBER` est vide, aucune notification n'est envoyée (le site
continue de fonctionner normalement).

## FTP
- Host: ftp-12.camoo.net
- Port: 21
- User: trugro9159

## Sécurité
- **Ne déployez pas de fichier `.htaccess`** sur cet hébergement : le vhost de
  trugroup.cm a `AllowOverride None`, donc la présence d'un `.htaccess` (quel
  que soit son contenu) provoque une erreur 500 sur tout le site (vérifié le
  2026-09-15). Ce n'est de toute façon pas nécessaire : le routage se fait par
  `?page=...` et HTTPS est déjà forcé au niveau de la plateforme. Voir
  `.htaccess.DO-NOT-DEPLOY` pour les détails et une version de secours si vous
  changez un jour d'hébergeur.
- Le dossier `gestion-647a0f15/` n'est jamais lié depuis le site public — ne le
  partagez qu'aux personnes autorisées à gérer le contenu. Vous pouvez le
  renommer (modifier `ADMIN_PATH_SLUG` dans `config.php` et renommer le dossier)
  si vous souhaitez changer l'URL.
- Pensez à restreindre les permissions serveur de `includes/config.php` (600/640).
- `uploads/cv/` stocke les CV envoyés par les candidats (PDF uniquement, type
  MIME vérifié côté serveur, nom de fichier aléatoire).

## Test rapide
- Ouvrir `https://trugroup.cm`
- Naviguer dans les pages, vérifier les accents et la mise en forme
- Envoyer un message via Contact et une candidature via Carrières, vérifier
  leur arrivée dans le back-office et la notification WhatsApp
