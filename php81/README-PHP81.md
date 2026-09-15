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
- `includes/` est bloqué par `.htaccess` (accès direct refusé).
- Le site force HTTPS via `.htaccess` (nécessaire pour protéger le login admin).
- Le dossier `gestion-647a0f15/` n'est jamais lié depuis le site public — ne le
  partagez qu'aux personnes autorisées à gérer le contenu. Vous pouvez le
  renommer (modifier `ADMIN_PATH_SLUG` dans `config.php` et renommer le dossier)
  si vous souhaitez changer l'URL.
- Pensez à restreindre les permissions serveur de `includes/config.php` (600/640).
- `uploads/cv/` stocke les CV envoyés par les candidats ; l'exécution de scripts
  y est désactivée par `.htaccess`.

## Test rapide
- Ouvrir `https://trugroup.cm`
- Naviguer dans les pages, vérifier les accents et la mise en forme
- Envoyer un message via Contact et une candidature via Carrières, vérifier
  leur arrivée dans le back-office et la notification WhatsApp
