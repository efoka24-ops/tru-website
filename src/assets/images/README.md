# 📂 Structure des Images et Assets

## Organisation des Images - TRU GROUP Frontend

```
src/assets/
├── trugroup-logo.png          ✅ Logo principal (PNG)
├── trugroup-logo.jfif         ✅ Logo alternative (JFIF)
└── images/
    ├── services/              📁 Images des services
    │   ├── conseil.jpg
    │   ├── digital.jpg
    │   ├── dev.jpg
    │   ├── projet.jpg
    │   ├── telemedicine.jpg
    │   └── formation.jpg
    │
    ├── solutions/             📁 Images des solutions
    │   ├── mokine.jpg
    │   ├── mokine-veto.jpg
    │   └── mokine-kid.jpg
    │
    ├── team/                  📁 Photos de l'équipe
    │   ├── member-1.jpg
    │   ├── member-2.jpg
    │   ├── member-3.jpg
    │   ├── member-4.jpg
    │   └── member-5.jpg
    │
    ├── projects/              📁 Images des projets
    │   ├── project-1.jpg
    │   ├── project-2.jpg
    │   ├── project-3.jpg
    │   └── project-case-study-1.pdf
    │
    ├── testimonials/          📁 Photos des témoignages
    │   ├── client-1.jpg
    │   ├── client-2.jpg
    │   ├── client-3.jpg
    │   └── client-4.jpg
    │
    ├── icons/                 📁 Icônes custom
    │   ├── feature-1.svg
    │   ├── feature-2.svg
    │   ├── payment-method.svg
    │   └── tech-stack.svg
    │
    ├── banners/               📁 Bannières et backgrounds
    │   ├── hero-bg.jpg
    │   ├── services-banner.jpg
    │   ├── solutions-banner.jpg
    │   ├── team-banner.jpg
    │   └── contact-banner.jpg
    │
    └── mockups/               📁 Mockups et screenshots
        ├── dashboard-mockup.png
        ├── mobile-mockup.png
        ├── app-screenshot-1.png
        └── app-screenshot-2.png
```

---

## 📋 Guide d'Utilisation

### 1. Import des Images dans les Composants

```jsx
// Import explicite
import mokineImage from '../assets/images/solutions/mokine.jpg';

// Ou en REST basé sur le dossier
import { useFetch } from '../hooks/useFetch';

// Dans le composant
<img src={mokineImage} alt="Solution Mokine" />
```

### 2. Services Images

**Emplacement:** `src/assets/images/services/`

Utilisez pour afficher les images des 6 services principaux:
- Conseil & Organisation
- Transformation digitale
- Développement d'applications
- Gestion de projet & assistance
- Télémédecine vétérinaire (Mokine Veto)
- Formation

```jsx
import { services } from '../data/content';
import conseilImage from '../assets/images/services/conseil.jpg';

// Chaque service affiche son image correspondante
```

### 3. Solutions Images

**Emplacement:** `src/assets/images/solutions/`

Les 3 solutions principales:
- **Mokine** - Traçabilité et IoT
- **Mokine Veto** - Télémédecine vétérinaire
- **Mokine Kid** - Application mobile enfants

```jsx
import mokineImage from '../assets/images/solutions/mokine.jpg';
import mokineVetoImage from '../assets/images/solutions/mokine-veto.jpg';
import mokineKidImage from '../assets/images/solutions/mokine-kid.jpg';
```

### 4. Photos de l'Équipe

**Emplacement:** `src/assets/images/team/`

Photos des membres de l'équipe pour la page Team et Dashboard.

**Convention de nommage:**
- `member-1.jpg` à `member-5.jpg` (ou plus selon nombre)

```jsx
import member1 from '../assets/images/team/member-1.jpg';

<img src={member1} alt="Nom du membre" className="w-32 h-32 rounded-full" />
```

### 5. Projets

**Emplacement:** `src/assets/images/projects/`

Screenshots et images des projets réalisés.

Formats acceptés:
- PNG (screenshots)
- JPG (photos)
- PDF (case studies)

### 6. Témoignages

**Emplacement:** `src/assets/images/testimonials/`

Photos des clients/partenaires pour les témoignages.

Dimensions recommandées: 200x200px (carré pour uniformité)

### 7. Icônes Custom

**Emplacement:** `src/assets/images/icons/`

Icônes SVG custom (si Lucide React ne suffit pas).

```jsx
// Import SVG
import feature1Icon from '../assets/images/icons/feature-1.svg';

// Utilisation
<img src={feature1Icon} alt="Feature" className="w-6 h-6" />
```

### 8. Bannières

**Emplacement:** `src/assets/images/banners/`

Arrière-plans pour les sections principales.

Dimensions recommandées:
- Desktop: 1920x1080px
- Mobile: 768x1024px

---

## 🎨 Recommandations d'Optimisation

### Formats Recommandés

| Type | Format | Compression | Qualité |
|------|--------|-------------|---------|
| Photos | WebP/JPEG | 80-85% | Idéale |
| Icônes | SVG | N/A | Vecteur |
| Screenshots | PNG | Lossless | Élevée |
| Bannières | WebP | 75-80% | Bonne |
| Logo | PNG/SVG | N/A | Élevée |

### Tailles de Fichiers Cibles

```
Logo:                 < 50 KB
Icônes:              < 10 KB chacun
Photos profil:       < 100 KB
Bannières:           < 200 KB
Screenshots:         < 300 KB
```

### Dimensions Standard

```
Logo:                 512x512px (ou SVG)
Photos profil:        400x400px
Team photos:          500x500px
Service images:       800x600px
Bannières:            1920x1080px
Icônes:              256x256px (SVG) ou 64x64px (PNG)
```

---

## 🔄 Migration des Images Existantes

Les images actuellement utilisées via URL distantes (Unsplash, etc.) peuvent être:

1. **Téléchargées localement** vers les dossiers appropriés
2. **Optimisées** avec tools comme ImageOptim ou Squoosh
3. **Importées** via un système de gestion (Fichier ou CMS)
4. **Remplacées** dans les composants par les imports locaux

---

## ⚙️ Configuration d'Import

### vite.config.js

```javascript
export default {
  // ...
  resolve: {
    alias: {
      '@images': fileURLToPath(new URL('./src/assets/images', import.meta.url)),
    }
  }
}
```

### Utilisation avec l'alias

```jsx
import mokine from '@images/solutions/mokine.jpg';
```

---

## 🔐 Note Importante

**Droits d'auteur et Licences:**
- Vérifier la licence des images utilisées
- Pour Unsplash/Pixabay/etc: Créditer appropriément si requis
- Images custom du client: Obtenir permission d'utilisation
- Logo TRU GROUP: Propriété exclusive

---

## 📊 Checklist d'Optimisation

- [ ] Toutes les images sont compressées
- [ ] Formats appropriés (WebP/SVG/JPG/PNG)
- [ ] Dimensions respectent les standards
- [ ] Tailles de fichiers dans les limites
- [ ] Alt text complété sur tous les `<img>`
- [ ] Lazy loading implémenté si nécessaire
- [ ] Cache busting activé en production
- [ ] Responsive images (@media queries)
- [ ] Accessible aux lecteurs d'écran

---

## 📚 Ressources

- [WebP Format Guide](https://developers.google.com/speed/webp)
- [SVG Best Practices](https://www.smashingmagazine.com/articles/svg-tips/)
- [Image Optimization Tools](https://squoosh.app/)
- [Lucide React Icons](https://lucide.dev/)

---

*Structure d'images - TRU GROUP - Dernière mise à jour: Février 2026*
