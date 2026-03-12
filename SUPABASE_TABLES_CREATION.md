# 📊 Vérification et Création des Tables Supabase

## ✅ Statut - 22 Février 2025

### Tables à Créer dans Supabase

Les 5 tables suivantes **n'existent pas encore** dans votre base Supabase et doivent être créées:

1. **jobs** - Offres d'emploi
2. **candidature** - Candidatures/Applications
3. **actualite** - Actualités/News/Blog
4. **temoignages** - Témoignages/Testimonials
5. **projets_realises** - Projets réalisés/Completed Projects

### 📌 Instructions pour Créer les Tables

#### Étape 1: Accéder à Supabase
1. Allez sur https://app.supabase.com
2. Connectez-vous avec vos identifiants
3. Sélectionnez votre projet TRU

#### Étape 2: Ouvrir l'SQL Editor
1. Dans le menu de gauche, cliquez sur **"SQL Editor"**
2. Cliquez sur **"New Query"**

#### Étape 3: Copier-Coller le Script SQL
Copier le contenu du fichier `create-supabase-tables.sql` et coller dans l'éditeur SQL.

OU exécutez directement ce script:

```sql
-- 1. Table jobs (Offres d'emploi)
CREATE TABLE IF NOT EXISTS public.jobs (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  type VARCHAR(50),
  department VARCHAR(100),
  requirements TEXT,
  salary_range VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table candidature (Candidatures/Applications)
CREATE TABLE IF NOT EXISTS public.candidature (
  id BIGSERIAL PRIMARY KEY,
  job_id BIGINT,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  cv_url VARCHAR(500),
  cover_letter TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(job_id) REFERENCES jobs(id) ON DELETE CASCADE
);

-- 3. Table actualite (Actualités/News)
CREATE TABLE IF NOT EXISTS public.actualite (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  excerpt VARCHAR(500),
  content TEXT,
  image_url VARCHAR(500),
  author VARCHAR(100),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Table temoignages (Témoignages/Testimonials)
CREATE TABLE IF NOT EXISTS public.temoignages (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255),
  company VARCHAR(255),
  message TEXT NOT NULL,
  rating INT DEFAULT 5,
  image_url VARCHAR(500),
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table projets_realises (Projets réalisés/Completed Projects)
CREATE TABLE IF NOT EXISTS public.projets_realises (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  image_url VARCHAR(500),
  client VARCHAR(255),
  category VARCHAR(100),
  technologies TEXT[],
  results TEXT,
  published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Étape 4: Exécuter le Script
Cliquez sur le bouton **"Run"** (ou Ctrl+Enter) pour exécuter le script SQL.

#### Étape 5: Vérifier la Création
Une fois exécuté, vous devriez voir un message "Success" en haut à droite. Les 5 nouvelles tables doivent apparaître dans la section "Tables" de la gauche.

---

## 🔌 Endpoints API Créés

Une fois les tables créées, les endpoints suivants seront opérationnels:

### 1. **Jobs (Offres d'Emploi)**
```
GET    /api/jobs                    - Récupérer tous les jobs
POST   /api/jobs                    - Créer un job
PUT    /api/jobs/:id                - Modifier un job
DELETE /api/jobs/:id                - Supprimer un job
```

### 2. **Applications/Candidatures**
```
GET    /api/applications            - Récupérer toutes les candidatures
POST   /api/applications            - Soumettre une candidature
PUT    /api/applications/:id        - Mettre à jour une candidature
DELETE /api/applications/:id        - Supprimer une candidature
```

### 3. **Actualités/News**
```
GET    /api/news                    - Récupérer tous les articles
GET    /api/actualite               - Alias pour la même endpoint
POST   /api/news                    - Créer un article
PUT    /api/news/:id                - Modifier un article
DELETE /api/news/:id                - Supprimer un article
```

### 4. **Témoignages/Testimonials**
```
GET    /api/testimonials            - Récupérer tous les témoignages
POST   /api/testimonials            - Créer un témoignage
PUT    /api/testimonials/:id        - Modifier un témoignage
DELETE /api/testimonials/:id        - Supprimer un témoignage
```

### 5. **Projets Réalisés**
```
GET    /api/projets-realises        - Récupérer tous les projets
GET    /api/projets-realises/:id    - Récupérer un projet
POST   /api/projets-realises        - Créer un projet
PUT    /api/projets-realises/:id    - Modifier un projet
DELETE /api/projets-realises/:id    - Supprimer un projet
```

---

## 📝 Schémas des Tables

### jobs
| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGSERIAL | Identifiant unique |
| title | VARCHAR(255) | Titre du poste |
| description | TEXT | Description du poste |
| location | VARCHAR(255) | Localisation |
| type | VARCHAR(50) | Type (CDI, CDD, Stage, etc.) |
| department | VARCHAR(100) | Département |
| requirements | TEXT | Requirement/Compétences |
| salary_range | VARCHAR(100) | Gamme de salaire |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date modification |

### candidature
| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGSERIAL | Identifiant unique |
| job_id | BIGINT | FK vers jobs |
| first_name | VARCHAR(100) | Prénom |
| last_name | VARCHAR(100) | Nom |
| email | VARCHAR(255) | Email |
| phone | VARCHAR(20) | Téléphone |
| cv_url | VARCHAR(500) | URL du CV |
| cover_letter | TEXT | Lettre de motivation |
| status | VARCHAR(50) | Status (pending, accepted, rejected) |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date modification |

### actualite
| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGSERIAL | Identifiant unique |
| title | VARCHAR(255) | Titre |
| slug | VARCHAR(255) | URL-friendly slug |
| excerpt | VARCHAR(500) | Extrait/Résumé |
| content | TEXT | Contenu complet |
| image_url | VARCHAR(500) | URL image |
| author | VARCHAR(100) | Auteur |
| published | BOOLEAN | Publié ou brouillon |
| published_at | TIMESTAMP | Date publication |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date modification |

### temoignages
| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGSERIAL | Identifiant unique |
| name | VARCHAR(255) | Nom du client |
| title | VARCHAR(255) | Titre/Position |
| company | VARCHAR(255) | Entreprise |
| message | TEXT | Témoignage |
| rating | INT | Note (1-5) |
| image_url | VARCHAR(500) | Photo |
| published | BOOLEAN | Visible ou non |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date modification |

### projets_realises
| Colonne | Type | Description |
|---------|------|-------------|
| id | BIGSERIAL | Identifiant unique |
| title | VARCHAR(255) | Titre du projet |
| slug | VARCHAR(255) | URL slug |
| description | TEXT | Description |
| image_url | VARCHAR(500) | Image principale |
| client | VARCHAR(255) | Nom du client |
| category | VARCHAR(100) | Catégorie |
| technologies | TEXT[] | Array des technos |
| results | TEXT | Résultats obtenus |
| published | BOOLEAN | Visible ou brouillon |
| created_at | TIMESTAMP | Date création |
| updated_at | TIMESTAMP | Date modification |

---

## 🔄 Code Backend Mis à Jour

Tous les endpoints API ont été mis à jour pour utiliser Supabase:

### Fichiers Modifiés:

1. **backend/lib/supabase.js** (lignes 458-750+)
   - Ajouté exports pour: `candidature`, `actualite`, `temoignages`, `projetsRealises`
   - Chaque export contient les méthodes CRUD: `getAll()`, `getById()`, `create()`, `update()`, `delete()`

2. **backend/server.js**
   - Converti `/api/applications` (candidature) de data.json → Supabase
   - Converti `/api/testimonials` (temoignages) de data.json → Supabase
   - Converti `/api/news` (actualite) de data.json → Supabase
   - Créé `/api/projets-realises` avec CRUD complet
   - Tous les endpoints sont maintenant **asynchrones** et utilisent Supabase

---

## ✨ Prochaines Étapes

1. ✅ Exécuter le script SQL Supabase (créer les 5 tables)
2. ✅ Vérifier que les tables apparaissent dans Supabase Dashboard
3. ✅ Redémarrer le backend (déjà fait)
4. ✅ Tester les endpoints (GET /api/jobs, POST, etc.)
5. ✅ Intégrer dans le backoffice pour CRUD admin
6. ✅ Tester la synchronisation frontend/backend

---

## 🧪 Commandes de Test

Une fois les tables créées (après exécution du script SQL):

```bash
# Tester les endpoints
curl http://localhost:5000/api/jobs
curl http://localhost:5000/api/applications
curl http://localhost:5000/api/news
curl http://localhost:5000/api/testimonials
curl http://localhost:5000/api/projets-realises
```

---

## 📞 Support

En cas de problème lors de la création des tables:
1. Vérifiez que vous êtes connecté au bon projet Supabase
2. Vérifiez que vous avez les permissions admin
3. Regardez les erreurs SQL dans Supabase SQL Editor
4. Créez les tables une par une si le script complet échoue
