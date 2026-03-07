# Synchronisation en Temps Réel - Guide d'Implémentation

## Résumé du Problème et Solution

### ❌ Problème
- Les modifications faites dans le backoffice ne s'affichent pas sur le frontend
- Les données existantes peuvent être écrasées lors des push/mises à jour
- Pas de synchronisation entre le backoffice et le frontend

### ✅ Solution
Un système de synchronisation en temps réel avec fusion intelligente des données

---

## Fichiers Créés

### 1. **realtimeSyncService.js** 🔧
Fichier: `backoffice/src/services/realtimeSyncService.js`

**Responsabilités:**
- Fusion intelligente des données (préservation des champs)
- Détection des changements
- Notification du frontend
- Queue de synchronisation asynchrone

**Exemple d'utilisation:**
```javascript
import { realtimeSyncService } from '@/services/realtimeSyncService';

// Synchroniser les paramètres
await realtimeSyncService.syncSettings({
  companyName: 'Nouveau nom',
  email: 'new@email.com'
});
// ✓ Les données existantes sont préservées
```

---

### 2. **useRealtimeSync.js** ⚛️
Fichier: `backoffice/src/hooks/useRealtimeSync.js`

**Responsabilités:**
- Hook React pour utiliser le service
- Gestion de l'état (syncing, error, lastSyncTime)
- Méthodes raccourcies (syncSettings, syncTeam, etc.)

**Exemple d'utilisation:**
```javascript
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

export function MyComponent() {
  const { syncSettings, syncing, syncError } = useRealtimeSync();
  
  const handleSave = async () => {
    await syncSettings({ name: 'TRU Group' });
  };

  return (
    <div>
      {syncing && <p>Synchronisation...</p>}
      {syncError && <p style={{ color: 'red' }}>{syncError}</p>}
      <button onClick={handleSave}>Sauvegarder</button>
    </div>
  );
}
```

---

### 3. **RealtimeSyncIndicator.jsx** 📊
Fichier: `backoffice/src/components/RealtimeSyncIndicator.jsx`

**Responsabilités:**
- Indicateur visuel de synchronisation
- Affiche le statut en temps réel
- Bouton pour voir les détails

**Intégration:**
```javascript
// Dans App.jsx ou AdminLayout.jsx
import RealtimeSyncIndicator from '@/components/RealtimeSyncIndicator';

export function App() {
  return (
    <div>
      {/* Votre contenu */}
      <RealtimeSyncIndicator />  {/* Indicateur en bas à droite */}
    </div>
  );
}
```

---

### 4. **REALTIME_SYNC_CONFIG.md** 📖
Fichier: `backoffice/REALTIME_SYNC_CONFIG.md`

Guide complet avec:
- Architecture du système
- Installation et configuration
- Cas d'usage
- Dépannage

---

### 5. **realtimeSync.js (Backend)** 🔌
Fichier: `backend/middleware/realtimeSync.js`

**Middlewares pour Express:**
- `smartMergeMiddleware` - Fusion intelligente
- `notifyFrontendMiddleware` - Notification du frontend
- `validateChangesMiddleware` - Validation des changements

---

### 6. **SettingsPageWithSync.jsx** 📝
Fichier: `backoffice/src/pages/SettingsPageWithSync.jsx`

Exemple complet d'implémentation avec:
- Formulaire de paramètres
- État de synchronisation
- Gestion des erreurs
- Préservation des données

---

## Étapes d'Implémentation

### Étape 1: Intégrer dans vos pages

Remplacez vos appels API directs par le hook:

**Avant:**
```javascript
const handleSave = async () => {
  const response = await fetch('/api/settings', {
    method: 'PUT',
    body: JSON.stringify(data)
  });
  const result = await response.json();
  // ❌ Problème: les données peuvent être écrasées
};
```

**Après:**
```javascript
const { syncSettings } = useRealtimeSync();

const handleSave = async () => {
  await syncSettings(data);
  // ✅ Fusion intelligente, données préservées
};
```

---

### Étape 2: Ajouter l'indicateur de sync

Dans votre layout principal:

```javascript
import RealtimeSyncIndicator from '@/components/RealtimeSyncIndicator';

export default function AdminLayout() {
  return (
    <div>
      {/* Votre contenu */}
      <RealtimeSyncIndicator />  {/* ← Ajouter ici */}
    </div>
  );
}
```

---

### Étape 3: Configurer le backend (optionnel mais recommandé)

Dans `server.js`:

```javascript
import {
  smartMergeMiddleware,
  notifyFrontendMiddleware,
  validateChangesMiddleware
} from './middleware/realtimeSync.js';

app.use(smartMergeMiddleware);
app.use(notifyFrontendMiddleware);
app.use(validateChangesMiddleware);
```

---

### Étape 4: Variables d'Environnement

Ajouter à `.env` du backoffice:

```env
VITE_BACKEND_URL=https://tru-backend-o1zc.onrender.com
VITE_FRONTEND_URL=https://trugroup.vercel.app
VITE_WEBHOOK_URL=https://votre-webhook-endpoint
```

---

## Flux de Synchronisation

```
┌──────────────────────────────────────────────┐
│ 1. Utilisateur modifie les paramètres        │
│    dans le backoffice                        │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 2. syncSettings() est appelé                 │
│    - Récupère les données existantes         │
│    - Détecte les changements                 │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 3. Fusion intelligente                       │
│    - Fusionne les données                    │
│    - Préserve les champs spécifiés          │
│    - Crée les timestamps                     │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 4. Envoi au backend                          │
│    PUT /api/settings                         │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 5. Backend traite (fusion supplémentaire)    │
│    - Valide les données                      │
│    - Sauvegarde en base de données           │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 6. Notification du frontend                  │
│    - Webhook ou CustomEvent                  │
│    - Les données s'affichent aussitôt       │
└──────────────────┬───────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────┐
│ 7. ✅ Synchronisation complète               │
│    - Backoffice modifié                      │
│    - Frontend mis à jour                     │
│    - Données préservées                      │
└──────────────────────────────────────────────┘
```

---

## Champs Préservés par Défaut

| Entité | Champs Préservés |
|--------|------------------|
| **Settings** | `createdAt`, `updatedBy` |
| **Team** | `createdAt`, `joinDate`, `employeeId` |
| **Services** | `createdAt`, `views`, `rating` |
| **Solutions** | `createdAt`, `views`, `category` |

Vous pouvez personnaliser via `preserveFields`:

```javascript
await sync('/api/custom', 'PUT', data, {
  preserveFields: ['field1', 'field2', 'field3']
});
```

---

## Avantages

✅ **Synchronisation bidirectionnelle**
- Backoffice → Backend → Frontend

✅ **Préservation des données**
- Les champs sensibles ne sont jamais écrasés
- L'historique est conservé

✅ **Détection intelligente**
- Les mises à jour inutiles sont évitées
- Améliore les performances

✅ **Queue de synchronisation**
- Les mises à jour rapides sont gérées
- Pas de conflits de données

✅ **Interface utilisateur**
- Indicateur de synchronisation en temps réel
- Feedback utilisateur immédiat

---

## Dépannage

### Les modifications n'apparaissent pas

1. Vérifiez que `RealtimeSyncIndicator` est intégré
2. Vérifiez que `notifyFrontend: true` dans les options
3. Vérifiez la console pour les erreurs

### Les anciennes données sont perdues

1. Vérifiez les `preserveFields` configurés
2. Assurez-vous que les données fusionnées sont correctes
3. Vérifiez les logs du serveur

### Les mises à jour sont lentes

1. Utilisez `queueSync()` pour les batch updates
2. Vérifiez la connexion réseau
3. Augmentez les timeouts si nécessaire

---

## Prochaines Étapes

1. ✅ Créer les fichiers (déjà fait)
2. 🔨 Intégrer dans vos pages existantes
3. 🧪 Tester avec le frontend et le backend
4. 📊 Monitorer les logs de synchronisation
5. 🚀 Déployer en production

---

## Support

Pour plus d'informations:
- [Guide Configuration Détaillée](./REALTIME_SYNC_CONFIG.md)
- [Exemple Complet](./src/pages/SettingsPageWithSync.jsx)
- [Service Backend](../backend/middleware/realtimeSync.js)

Besoin d'aide? Consultez les fichiers sources avec les commentaires détaillés.
