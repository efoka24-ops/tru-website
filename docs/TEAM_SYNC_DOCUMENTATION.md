# 📡 Synchronisation Équipe - Documentation Complète

## Vue d'ensemble

Le système de synchronisation de l'équipe établit une communication bidirectionnelle entre :
- **Backoffice** (`http://localhost:3001`) - Gestion des données
- **Frontend Site TRU** (`http://localhost:5173`) - Affichage public  
- **Site TRU Principal** (`http://localhost:3000`) - Autre instance

## Architecture

```
┌─────────────────────┐
│   BACKOFFICE        │
│   (Port 3001)       │
│                     │
│  EquipePage.jsx     │
│  - Créer/Éditer     │
│  - Synchronise vers │
└──────────┬──────────┘
           │
           │ POST /team-update
           ▼
┌─────────────────────────────────────────┐
│      Frontend Admin TRU                  │
│      (http://localhost:5173/api)        │
│      - Reçoit les notifications         │
│      - Met à jour l'affichage           │
└─────────────────────────────────────────┘
           ▲
           │ GET /team
           │
┌─────────────────────────────────────────┐
│      Site TRU Principal                  │
│      (http://localhost:3000)            │
│      - Affiche les données              │
│      - TeamSection.jsx                  │
│      - Polls les mises à jour           │
└─────────────────────────────────────────┘
```

## Flux de données

### 1. Récupération initiale (Backoffice)

```javascript
// Dans EquipePage.jsx
const fetchFrontendTeam = async (source = 'default') => {
  // Essaie le frontend d'abord
  // Puis le site TRU
  // Finalement le backend base44
};
```

**Ordre de priorité :**
1. Frontend Admin (`http://localhost:5173/api/team`)
2. Site TRU (`http://localhost:3000/api/team`)
3. Backend (`base44.entities.TeamMember.list()`)

### 2. Synchronisation après mutation (Backoffice)

Quand un membre est créé, modifié ou supprimé :

```javascript
const syncTeamToFrontend = async (action, member) => {
  const payload = {
    action: 'create|update|delete',
    member: {...},
    timestamp: new Date().toISOString(),
    source: 'backoffice'
  };

  // Notifie le frontend admin
  POST http://localhost:5173/api/team-update

  // Notifie le site TRU
  POST http://localhost:3000/api/team-update
};
```

### 3. Récupération depuis le site public (TeamSection.jsx)

```javascript
// useQuery avec refetch automatique toutes les 60 secondes
const { data: teamMembers = [], refetch } = useQuery({
  queryKey: ['teamMembers'],
  queryFn: getTeamMembers,
  refetchInterval: 60000,
  staleTime: 30000,
});

// Écoute les mises à jour en temps réel
useEffect(() => {
  const unsubscribe = listenToTeamUpdates((update) => {
    refetch(); // Recharge les données
  });
}, [refetch]);
```

## Endpoints API requises

### Site TRU Frontend (Port 5173)

#### `GET /api/team`
Récupère la liste des membres de l'équipe
```json
Response:
[
  {
    "id": "uuid",
    "name": "Jean Dupont",
    "role": "Fondateur & PDG",
    "description": "...",
    "photo_url": "https://...",
    "email": "jean@example.com",
    "phone": "+237 6XX XXX XXX",
    "linkedin": "https://linkedin.com/...",
    "expertise": ["React", "Node.js"],
    "achievements": ["10 ans exp", "..."],
    "is_founder": true,
    "is_visible": true,
    "display_order": 0
  }
]
```

#### `POST /api/team-update`
Reçoit les mises à jour du backoffice
```json
Request:
{
  "action": "create|update|delete",
  "member": {...},
  "timestamp": "2024-12-07T...",
  "source": "backoffice"
}

Response:
{
  "success": true,
  "message": "Update received"
}
```

### Site TRU Principal (Port 3000)

#### `GET /api/team`
Récupère la liste des membres (même structure)

#### `POST /api/team-update`
Reçoit les mises à jour (même structure)

## Configuration des URLs

### Dans le Backoffice (`src/pages/EquipePage.jsx`)

```javascript
const FRONTEND_API_URL = 'http://localhost:5173/api';
const TRU_SITE_URL = 'http://localhost:3000/api';
```

### Dans le Site Public (`src/api/teamApi.js`)

```javascript
const BACKOFFICE_API = 'http://localhost:3001/api';
const ADMIN_FRONTEND_API = 'http://localhost:5173/api';
```

## Messages de log console

Le système loggue tout pour le débogage :

```
✅ Données équipe récupérées du frontend: 5 membres
✅ Notification create envoyée au frontend admin
📡 Team update received: create - Jean Dupont
🔄 Fetching team members...
👂 Setting up team updates listener...
```

## Gestion des erreurs

Chaque appel API a une gestion d'erreur avec fallback :

```javascript
try {
  // Essayer l'appel
} catch (error) {
  console.warn('⚠️ Service not available:', error.message);
  // Continuer avec la source suivante
}
```

**Pas d'arrêt en cas d'erreur** - Le système continue avec les autres sources de données.

## Polling vs Real-time

### Polling (Implémenté)
- Refetch React Query toutes les 60 secondes
- Polling manuel toutes les 30 secondes dans `listenToTeamUpdates`
- Simple et robuste

### Real-time (Optionnel - Future)
```javascript
// Pourrait utiliser WebSockets ou Server-Sent Events (SSE)
const eventSource = new EventSource('/api/team-updates');
eventSource.onmessage = (event) => {
  const update = JSON.parse(event.data);
  callback(update);
};
```

## Utilisation dans les composants

### Afficher l'équipe
```jsx
import { TeamSection } from '@/components/TeamSection';

export function Page() {
  return (
    <div>
      <TeamSection />
    </div>
  );
}
```

### Utiliser l'API directement
```jsx
import { getTeamMembers, getFounders } from '@/api/teamApi';

const members = await getTeamMembers();
const founders = await getFounders();
```

## Testing

### Tester la synchronisation

1. **Ouvrir le backoffice** : `http://localhost:3001`
2. **Ouvrir le site public** : `http://localhost:3000`
3. **Ouvrir la console du navigateur** sur les deux (F12)
4. **Ajouter un membre** dans le backoffice
5. **Observer les logs** : Les messages de sync apparaissent
6. **Actualiser** le site public → Le nouveau membre apparaît

### Vérifier les endpoints

```bash
# Récupérer les données du backoffice
curl http://localhost:3001/api/team

# Récupérer les données du site TRU
curl http://localhost:5173/api/team

# Tester une notification
curl -X POST http://localhost:5173/api/team-update \
  -H "Content-Type: application/json" \
  -d '{"action":"create","member":{"name":"Test"}}'
```

## Performance

- **Cache React Query** : 30 secondes
- **Stale time** : 5 minutes
- **Polling interval** : 30-60 secondes
- **Notifications** : Quasi-instantané (async sans await sur le frontend)

## Améliorations possibles

1. **WebSockets** pour les vraies mises à jour en temps réel
2. **Server-Sent Events** pour un meilleur polling
3. **Notification audio/toast** quand un membre est ajouté
4. **Cacheing local** avec localStorage
5. **Offline support** avec service workers
6. **Analytics** pour tracker les consultations de profils

## Dépannage

### Les données ne se mettent pas à jour
- Vérifier que les URLs sont correctes
- Vérifier la console pour les erreurs
- Vérifier que les services tourment sur les bons ports
- Tester manuellement avec curl

### Les notifications ne sont pas envoyées
- Vérifier que fetch n'est pas bloqué par CORS
- Vérifier les logs : `console.warn('⚠️ Service not available')`
- Ajouter des headers CORS si nécessaire

### Performance lente
- Réduire `refetchInterval` si c'est trop fréquent
- Augmenter `staleTime` pour meilleur caching
- Implémenter WebSockets pour le temps réel

## Prochaines étapes

1. Implémenter les endpoints manquants côté backend
2. Ajouter les pages manquantes (Témoignages, Services, etc.)
3. Configurer les vrais domaines en production
4. Ajouter l'authentification et l'autorisation
5. Implémenter les WebSockets pour le vrai temps réel
