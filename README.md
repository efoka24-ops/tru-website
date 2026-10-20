# Carrières RCA — démonstration

Portail carrières (candidats + back-office recruteur) réalisé d'après la maquette
du site carrières Orange RCA. **Environnement de démonstration** : ce n'est pas le
site officiel d'Orange Centrafrique.

- Candidats : <https://trugroup.cm/carrieres-rca/>
- Recruteurs : <https://trugroup.cm/carrieres-rca/admin>

## Protections de la démonstration

- **Code d'accès partagé** (`DEMO_ACCESS_CODE`) exigé avant toute page, API ou fichier.
- Bandeau « Environnement de démonstration » sur chaque page et chaque courriel.
- `X-Robots-Tag: noindex` et `robots.txt` interdisant l'indexation.
- CV et pièces jointes hors de `public_html`, servis seulement au candidat ou à un recruteur.

## Fonctionnalités

**Candidat** : recherche (mot-clé, recherche avancée, tri, pagination), détail d'offre,
envoi à un ami, inscription, connexion, nom d'utilisateur oublié, mot de passe oublié
(code par SMS si téléphone vérifié, sinon par courriel), panier, recherches sauvegardées
avec alerte courriel, cooptations, options du compte (mot de passe, e-mail, téléphone
vérifié par SMS, préférences, suppression du compte), candidature en 7 étapes avec
brouillon, pièces jointes (5 Mo, type vérifié), signature et confirmation, retrait.
Déconnexion après 60 minutes d'inactivité.

**Recruteur** : tableau de bord et pipeline, offres (création, modification,
publication avec alertes aux recherches sauvegardées, clôture), candidatures (filtres,
dossier complet, téléchargement des pièces, changement de statut avec note interne et
notification par courriel ou SMS, historique), candidats, cooptations, journal des
courriels, gestion des recruteurs.

## Technique

PHP 8.1 sans framework, MySQL (`trugro9159_tru`, tables préfixées `rca_`),
configuration dans `/home/trugro9159/carrieres-rca.env` (modèle : `.env.example`).
SMS par [teeeotp](https://github.com/efoka24-ops/teeeotp) (projet `carrieres-rca`,
mobiles camerounais uniquement). Courriels par SMTP si configuré, sinon `mail()`.

| Dossier | Contenu |
|---|---|
| `public/` | Racine déployée dans `public_html/carrieres-rca/` |
| `public/lib/` | Http, Db, Auth (sessions), Demo (barrière), Mailer, Sms, Codes, Uploads… |
| `public/routes/` | API : `jobs`, `auth`, `account`, `applications`, `admin` |
| `public/views/` | `app.html` (candidat), `admin.html` (recruteur), `gate.php` (code d'accès) |

## Déploiement

1. Remplir `/home/<compte>/carrieres-rca.env` à partir de `.env.example`.
2. Téléverser `public/` dans `public_html/carrieres-rca/`.
3. `curl -X POST "https://trugroup.cm/carrieres-rca/install.php?token=<INSTALL_TOKEN>"` :
   crée les tables, les 11 offres de la maquette et le premier administrateur
   (mot de passe provisoire dans la réponse).
4. Supprimer `install.php` et `schema.sql` du serveur, vider `INSTALL_TOKEN`.

## Pare-feu de l'hébergeur (à régler)

Le pare-feu applicatif de Camoo (ModSecurity / Imunify360) rejette en `400` les requêtes
dont le contenu ressemble à une injection SQL — y compris du français ordinaire avec une
apostrophe (« Systèmes d'information », « l'équipe ») — puis **bloque l'adresse IP**
du visiteur sur tout trugroup.cm. Un candidat peut donc être bloqué en remplissant son
profil. À régler côté hébergement (cPanel → ModSecurity pour le domaine, ou support
Camoo pour assouplir la règle sur `/carrieres-rca/` et débloquer les adresses).
