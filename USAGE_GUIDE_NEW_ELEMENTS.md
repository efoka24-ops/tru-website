# 🎨 Guide d'Utilisation - Nouveaux Éléments Frontend

**Créé:** Février 2026  
**Pour:** Développeurs TRU GROUP Frontend

---

## 📚 Contenu

1. [Guide colors.js](#guide-colorsjs)
2. [Guide useFetch.js](#guide-usefetchjs)
3. [Guide NotFound.jsx](#guide-notfoundjsx)
4. [Guide Structure Images](#guide-structure-images)
5. [Exemples Complets](#exemples-complets)

---

## Guide colors.js

### Qu'est-ce que c'est?
Fichier centralisé contenant la **palette de couleurs complète** du projet TRU GROUP avec utilitaires pour les manipuler.

### Où l'importer?

```javascript
// Option 1: Import complet
import { colors, colorUtils } from '../data/colors';

// Option 2: Via l'index centralisé
import { colors } from '../data';

// Option 3: Import par défaut
import colorPalette from '../data/colors';
```

### Utilisation Basique

#### Couleurs Primaires
```jsx
import { colors } from '../data/colors';

export function MyComponent() {
  return (
    <div>
      {/* Couleur verte principale */}
      <button style={{ backgroundColor: colors.primary.main }}>
        Cliquez-moi
      </button>

      {/* Couleur verte foncée (hover) */}
      <button style={{ backgroundColor: colors.primary.dark }}>
        Survol
      </button>
    </div>
  );
}
```

#### Couleurs Secondaires (Slate)
```jsx
<section style={{ background: colors.secondary.bg }}>
  <h1 style={{ color: colors.secondary.darkMuted }}>Titre</h1>
  <p style={{ color: colors.secondary.light }}>Contenu</p>
</section>
```

#### Gradients Prédéfinis
```jsx
// Utiliser avec Tailwind CSS
<div className={`bg-gradient-to-r ${colors.gradients.primary}`}>
  Gradient vert
</div>

{/* Ou directement les classes */}
<div className="bg-gradient-to-r from-green-400 to-green-500">
  Même chose
</div>
```

#### Couleurs pour Services
```jsx
// Chaque service a sa propre palette
const serviceColors = colors.services.conseil; // Bleu

<div style={{ 
  background: colors.services.conseil.bg,
  borderLeft: `4px solid ${colors.services.conseil.icon}`
}}>
  <h3 style={{ color: colors.services.conseil.icon }}>
    Conseil & Organisation
  </h3>
</div>
```

### Utilisation Avancée - colorUtils

#### getServiceGradient()
```jsx
import { colorUtils } from '../data/colors';

// Récupère le gradient Tailwind pour un service
const gradient = colorUtils.getServiceGradient('digital');
// Retourne: "from-amber-500 to-orange-600"

<div className={`bg-gradient-to-r ${gradient}`}>
  Digital
</div>
```

#### getServiceIconColor()
```jsx
// Récupère la couleur d'icône pour un service
const color = colorUtils.getServiceIconColor('dev');
// Retourne: "#10b981"

<MonIcon color={color} />
```

#### getServiceBg()
```jsx
// Récupère la couleur de fond pour un service
const bgColor = colorUtils.getServiceBg('telemedicine');
// Retourne: "#ffe4e6"

<div style={{ backgroundColor: bgColor }} className="p-4 rounded-lg">
  Contenu
</div>
```

#### hexToRgba()
```jsx
// Convertit hex en rgba
const rgba = colorUtils.hexToRgba('#22c55e', 0.5);
// Retourne: "rgba(34, 197, 94, 0.5)"

<div style={{ backgroundColor: rgba }}>
  Semi-transparent
</div>
```

#### Utiliser avec Tailwind
```jsx
import { colors } from '../data/colors';

// Extraire les valeurs pour Tailwind
const primaryColor = colors.primary.main; // "#22c55e"

// Pattern: utiliser classes Tailwind avec les variables
<div>
  {/* Utiliser les classes fixes */}
  <button className="bg-green-500 hover:bg-green-600">
    Bouton Green
  </button>

  {/* Ou générer dynamiquement */}
  <div style={{ 
    backgroundColor: colors.primary.main,
    boxShadow: `0 0 0 4px ${colorUtils.hexToRgba(colors.primary.main, 0.1)}`
  }}>
    Box Shadow Custom
  </div>
</div>
```

### Palettes Disponibles

```javascript
colors = {
  primary: { light, main, dark, hover }        // Vert TRU
  secondary: { dark, darkMuted, muted, ... }  // Slate
  neutral: { white, black, gray100, ... }     // Neutres
  states: { success, error, warning, info }   // États
  gradients: { primary, slate, dark, ... }    // Gradients
  services: {
    conseil:     { gradient, icon, bg }
    digital:     { gradient, icon, bg }
    dev:         { gradient, icon, bg }
    projet:      { gradient, icon, bg }
    telemedicine: { gradient, icon, bg }
    formation:   { gradient, icon, bg }
  }
}
```

---

## Guide useFetch.js

### Qu'est-ce que c'est?
Hook personnalisé pour **récupérer des données** avec cache, gestion d'erreurs, et plusieurs variantes.

### Où l'importer?

```javascript
// Option 1: Import spécifique
import { useFetch, useFetchPaginated, useDataSync } from '../hooks/useFetch';

// Option 2: Via l'index centralisé
import { useFetch, useFetchPaginated, useDataSync } from '../hooks';
```

### Variant 1: useFetch() - Fetch Simple

#### Utilisation Basique
```jsx
import { useFetch } from '../hooks';

export function ServicesList() {
  const { data, loading, error, refetch } = useFetch(
    'https://api.example.com/services'
  );

  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error}</p>;

  return (
    <div>
      {data?.map(service => (
        <div key={service.id}>{service.name}</div>
      ))}
      <button onClick={() => refetch()}>Rafraîchir</button>
    </div>
  );
}
```

#### Options Avancées
```jsx
const { data, loading, error, refetch, invalidateCache, isStale } = useFetch(
  'https://api.example.com/services',
  {
    // Cache une durée personnalisée (ms)
    cacheDuration: 10 * 60 * 1000, // 10 minutes

    // Méthode HTTP
    method: 'GET',

    // Headers additionnels
    headers: {
      'Authorization': 'Bearer token123',
      'X-Custom-Header': 'value'
    },

    // Body pour POST/PUT
    body: {
      name: 'New Service',
      description: 'Service description'
    },

    // Sauter la requête initialement
    skip: true,

    // Clé de cache personnalisée
    key: 'my-custom-key',

    // Callbacks
    onSuccess: (data) => {
      console.log('✅ Données reçues:', data);
      // Faire quelque chose après succès
    },
    onError: (error) => {
      console.error('❌ Erreur:', error);
      // Gérer l'erreur
    }
  }
);

// Utilisation des states
return (
  <div>
    {loading && <Spinner />}
    {error && <div className="alert alert-error">{error}</div>}
    {isStale && <div className="alert alert-warning">Cache expiré</div>}
    {data && <DataDisplay data={data} />}
  </div>
);
```

#### Cas d'Usage Avancés
```jsx
// 1. Fetch conditionnel (skip)
const skipFetch = !userId;
const { data: user } = useFetch(
  `https://api.example.com/users/${userId}`,
  { skip: skipFetch }
);

// 2. Rafraîchir avec force
const handleRefresh = () => {
  refetch(true); // Force une nouvelle requête ignorant le cache
};

// 3. Invalider le cache manuellement
const handleDelete = async () => {
  await deleteService(id);
  invalidateCache(); // Vider le cache pour recharger
  refetch();
};

// 4. Chaîner les appels
const { data: user } = useFetch(
  `https://api.example.com/users/${userId}`
);

const { data: userServices } = useFetch(
  `https://api.example.com/users/${user?.id}/services`,
  { skip: !user?.id } // Attendre d'avoir l'utilisateur
);
```

### Variant 2: useFetchPaginated() - Pagination

#### Utilisation Basique
```jsx
import { useFetchPaginated } from '../hooks';

export function ItemsList() {
  const { 
    data,        // Array de tous les items chargés
    loading, 
    error, 
    page,        // Page actuelle
    hasMore,     // Y a-t-il plus d'items?
    loadMore,    // Charger la page suivante
    reset        // Revenir à la page 1
  } = useFetchPaginated(
    'https://api.example.com/items',
    10 // Items par page
  );

  return (
    <div>
      {data.map(item => <ItemCard key={item.id} item={item} />)}
      
      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Chargement...' : 'Charger plus'}
        </button>
      )}
    </div>
  );
}
```

#### Pagination Avancée
```jsx
const pagination = useFetchPaginated(
  'https://api.example.com/services',
  15 // Items par page
);

// Accéder à la page actuelle
console.log(pagination.page); // 1, 2, 3, etc.

// Aller à une page spécifique
<button onClick={() => pagination.setPage(3)}>
  Aller à la page 3
</button>

// Revenir au début
<button onClick={pagination.reset}>
  Réinitialiser
</button>
```

### Variant 3: useDataSync() - Synchronisation

#### Utilisation Basique
```jsx
import { useDataSync } from '../hooks';

export function EditForm() {
  const [formData, setFormData] = useState({});
  
  const { data, syncStatus, isSynced } = useDataSync(
    'https://api.example.com/settings',
    [formData] // Dépendances - sync quand formData change
  );

  return (
    <div>
      <input 
        value={formData.name}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          name: e.target.value
        }))}
      />
      
      {syncStatus === 'syncing' && <Spinner />}
      {syncStatus === 'synced' && <span>✅ Synced</span>}
      {syncStatus === 'error' && <span>❌ Error</span>}
    </div>
  );
}
```

#### États de Sync
```javascript
syncStatus peut être:
- 'idle'    → Rien ne se passe
- 'syncing' → Synchronisation en cours
- 'synced'  → Synchronisation réussie
- 'error'   → Erreur lors de la sync
```

---

## Guide NotFound.jsx

### Qu'est-ce que c'est?
Page **404 professionnelle** avec animations et suggestions de navigation.

### Où l'utiliser?

NotFound.jsx est **automatiquement utilisée** par App.jsx pour:
1. Routes 404 explicites: `http://domain.com/404`
2. Routes non trouvées (catch-all): `http://domain.com/n-importe-quoi`

### Personnaliser la Page 404

#### Modifier les Suggestions
**Fichier:** `src/pages/NotFound.jsx`

```jsx
const suggestions = [
  { label: 'Accueil', link: '/' },
  { label: 'Services', link: '/services' },
  // Ajouter/modifier ici
  { label: 'Mon Page', link: '/ma-page' },
];
```

#### Modifier le Message
```jsx
<h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
  Page non trouvée ← Modifier ici
</h1>
<p className="text-xl text-slate-600 leading-relaxed">
  Texte personnalisé ← Et ici
</p>
```

#### Modifier les Couleurs
```jsx
// Changer la couleur du 404
<div className="text-9xl font-bold 
  bg-gradient-to-r from-green-500 to-green-600 
  bg-clip-text text-transparent">
  404
</div>
```

### Utilisation Programmée
```jsx
import { useNavigate } from 'react-router-dom';

export function MyComponent() {
  const navigate = useNavigate();
  
  const handleError = () => {
    navigate('/404'); // Aller explicitement à la page 404
  };

  return <button onClick={handleError}>Aller à 404</button>;
}
```

---

## Guide Structure Images

### Où ranger les images?

```
src/assets/images/
├── services/       → Images des 6 services
├── solutions/      → Images des 3 solutions (Mokine, etc.)
├── team/          → Photos de l'équipe
├── projects/      → Images des projets
├── testimonials/  → Photos clients/partenaires
├── icons/         → Icônes custom SVG
├── banners/       → Bannières/backgrounds
└── mockups/       → Screenshots et mockups
```

### Importer les Images

#### Méthode 1: Import direct
```jsx
import mokineImage from '../assets/images/solutions/mokine.jpg';

<img src={mokineImage} alt="Mokine Solution" />
```

#### Méthode 2: Dynamique (URL string)
```jsx
const imagePath = new URL('../assets/images/solutions/mokine.jpg', import.meta.url).href;

<img src={imagePath} alt="Mokine" />
```

#### Méthode 3: Path relatif (depuis HTML)
```jsx
// Peut fonctionner mais moins préférable en React
<img src="/images/solutions/mokine.jpg" alt="Mokine" />
```

### Conventions de Nommage

```
Services:    conseil.jpg, digital.jpg, dev.jpg, etc. (minuscules-tirets)
Solutions:   mokine.jpg, mokine-veto.jpg, mokine-kid.jpg
Photos:      member-1.jpg, member-2.jpg, etc.
Icônes:      feature-icon.svg, feature-icon-alt.svg
Bannières:   hero-bg.jpg, services-banner.jpg, etc.
```

### Dimensions Recommandées

```
Logo:                512x512px (ou SVG)
Photos profil:       400x400px
Team photos:         500x500px
Service images:      800x600px
Bannières:           1920x1080px
Icônes:              256x256px (SVG) ou 64x64px (PNG)
Testimonials:        200x200px
Projects:            600x400px
```

### Optimisation

```javascript
// Utiliser WebP quand possible
services.jpg   → services.webp  (compression 75-80%)
banner.jpg     → banner.webp    (compression 75-80%)
logo.png       → Garder PNG     (lossless)
icons.svg      → SVG directement (vecteur)
```

### Lazy Loading
```jsx
<img 
  src={imagePath} 
  alt="Description" 
  loading="lazy"    // Charge seulement si visible
/>
```

---

## Exemples Complets

### Exemple 1: Composant Service Card
```jsx
import { useFetch } from '../hooks';
import { colors } from '../data';
import serviceImage from '../assets/images/services/conseil.jpg';

export function ServiceCard({ serviceId }) {
  const { data: service, loading } = useFetch(
    `https://api.example.com/services/${serviceId}`
  );

  if (loading) return <div>Chargement...</div>;

  return (
    <div className={`rounded-lg p-6 bg-gradient-to-r ${colors.gradients.primary}`}>
      <img 
        src={serviceImage}
        alt={service?.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />
      
      <h3 style={{ color: colors.services.conseil.icon }}>
        {service?.name}
      </h3>
      
      <p style={{ color: colors.secondary.light }}>
        {service?.description}
      </p>
    </div>
  );
}
```

### Exemple 2: Formulaire avec Sync
```jsx
import { useState } from 'react';
import { useDataSync } from '../hooks';
import { colors } from '../data';

export function SettingsForm() {
  const [settings, setSettings] = useState({
    companyName: 'TRU GROUP',
    email: 'info@trugroup.cm'
  });

  const { syncStatus } = useDataSync(
    'https://api.example.com/settings',
    [settings]
  );

  return (
    <div style={{ background: colors.secondary.bg, padding: '2rem' }}>
      <input
        type="text"
        value={settings.companyName}
        onChange={(e) => setSettings(prev => ({
          ...prev,
          companyName: e.target.value
        }))}
      />

      <div className="flex items-center gap-2 mt-2">
        {syncStatus === 'syncing' && <span>⏳ Sync...</span>}
        {syncStatus === 'synced' && (
          <span style={{ color: colors.states.success }}>✅ Synced</span>
        )}
        {syncStatus === 'error' && (
          <span style={{ color: colors.states.error }}>❌ Error</span>
        )}
      </div>
    </div>
  );
}
```

### Exemple 3: Liste Paginée
```jsx
import { useFetchPaginated } from '../hooks';
import { colors } from '../data';
import { Card } from '../components/Card';

export function ProjectsList() {
  const {
    data: projects,
    loading,
    hasMore,
    loadMore
  } = useFetchPaginated('https://api.example.com/projects', 12);

  return (
    <div style={{ background: colors.secondary.bg, padding: '2rem' }}>
      <div className="grid grid-cols-3 gap-4">
        {projects.map(project => (
          <Card key={project.id}>
            <img 
              src={`../assets/images/projects/${project.image}`}
              alt={project.name}
              className="w-full h-32 object-cover rounded-lg mb-2"
            />
            <h3>{project.name}</h3>
            <p style={{ color: colors.secondary.light }}>
              {project.description}
            </p>
          </Card>
        ))}
      </div>

      {hasMore && (
        <button 
          onClick={loadMore}
          disabled={loading}
          style={{ 
            background: colors.primary.main,
            color: 'white',
            marginTop: '2rem'
          }}
        >
          {loading ? 'Chargement...' : 'Charger plus de projets'}
        </button>
      )}
    </div>
  );
}
```

---

## ✅ Checklist d'Utilisation

- [ ] J'ai importé `colors` pour les couleurs
- [ ] J'utilise `useFetch` pour les requêtes API
- [ ] J'utilise `useFetchPaginated` pour les listes paginées
- [ ] J'utilise `useDataSync` pour les formulaires connectés
- [ ] J'affiche les images depuis `src/assets/images/`
- [ ] Je comprends que 404 est automatique (catch-all)
- [ ] J'utilise `colorUtils` pour les transformations de couleur
- [ ] Je respecte les dimensions recommandées pour les images

---

## 🆘 Dépannage

### Problème: Couleurs non appliquées
**Solution:** Vérifier l'import
```jsx
// ✅ Correct
import { colors } from '../data/colors';

// ❌ Incorrect
import colors from '../colors';
```

### Problème: Images non chargées
**Solution:** Vérifier le chemin
```jsx
// ✅ Correct - Import direct
import image from '../assets/images/services/conseil.jpg';

// ❌ Incorrect - Chemin string
src="images/services/conseil.jpg"
```

### Problème: useFetch ne remonte pas les données
**Solution:** Vérifier l'URL et les dépendances
```jsx
// Utiliser le hook correctement
const { data, loading, error } = useFetch(url);

// Ajouter skip si besoin
const { data } = useFetch(url, { skip: !isReady });
```

---

## 📞 Questions?

Consultez les ressources:
- `src/data/colors.js` - Code source des couleurs
- `src/hooks/useFetch.js` - Code source du hook
- `src/pages/NotFound.jsx` - Page 404 complète
- `src/assets/images/README.md` - Structure images

---

*Guide d'utilisation - TRU GROUP Frontend - Février 2026*
