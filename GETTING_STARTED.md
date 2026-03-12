# Guide d'utilisation du projet TRU Website

## 🚀 Démarrage rapide

### Première installation

```bash
# Clonez le dépôt
git clone https://github.com/efoka24-ops/tru-website.git
cd tru-website

# Installez les dépendances
npm install
cd backend && npm install && cd ..
cd backoffice && npm install && cd ..
```

### Démarrage des services

Ouvrez 3 terminaux différents et lancez :

**Terminal 1 - Backend (API sur port 5000)**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend (Site sur port 5173/5174)**
```bash
npm run dev
```

**Terminal 3 - Back Office (Admin sur port 3000)**
```bash
cd backoffice
npm run dev
```

## 📱 Accès aux applications

- **Frontend** : http://localhost:5173 ou http://localhost:5174
- **Back Office** : http://localhost:3000/admin
- **API** : http://localhost:5000/api

## 🔧 Configuration

### Backend (.env)
```
PORT=5000
NODE_ENV=development
```

### Front-end (vite.config.js)
Le proxy est configuré pour rediriger `/api` vers `http://localhost:5000`

### Back Office (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📊 Structure des données

### Services
```json
{
  "id": 1,
  "name": "Service Name",
  "description": "Service description",
  "price": 100,
  "category": "business",
  "icon": "📦"
}
```

### Équipe
```json
{
  "id": 1,
  "name": "John Doe",
  "position": "Director",
  "bio": "Bio here",
  "email": "john@example.com",
  "image": "/path/to/image.jpg"
}
```

### Contenu
```json
{
  "id": 1,
  "title": "Page Title",
  "description": "Page description",
  "page": "home",
  "type": "hero"
}
```

## 🛠️ Développement

### Ajouter un nouveau service API

Dans `backend/server.js` :

```javascript
app.get('/api/new-endpoint', (req, res) => {
  const data = readData();
  res.json(data.newEndpoint);
});
```

### Créer un nouveau composant

Dans `src/components/NewComponent.jsx` :

```jsx
export default function NewComponent() {
  return (
    <div className="component">
      {/* Votre contenu */}
    </div>
  )
}
```

### Utiliser l'API frontend

Dans n'importe quelle page :

```jsx
import { apiService } from '@/api/apiService'

export default function Page() {
  const [data, setData] = useState([])

  useEffect(() => {
    apiService.getServices().then(setData)
  }, [])

  return <div>{/* Afficher data */}</div>
}
```

## 🐛 Dépannage

### Port déjà utilisé
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -i :5000
kill -9 <PID>
```

### Erreur CORS
Vérifiez que le backend a CORS activé :
```javascript
app.use(cors());
```

### API non accessible
1. Vérifiez que le backend est en cours d'exécution
2. Vérifiez que le port 5000 est correct
3. Vérifiez la configuration du proxy dans vite.config.js

## 📦 Build pour production

```bash
# Frontend
npm run build
# Génère dist/

# Backend
# Pas de build nécessaire, prêt pour la production

# Back Office
cd backoffice
npm run build
# Génère dist/
```

## 🔐 Sécurité

Pour la production :
1. Utilisez une vraie base de données (MongoDB, PostgreSQL)
2. Ajoutez l'authentification
3. Utilisez HTTPS
4. Configurez les variables d'environnement sécurisées
5. Validez toutes les entrées

## 📞 Support

En cas de problème :
1. Consultez les logs (terminal)
2. Vérifiez les requêtes réseau (F12)
3. Vérifiez la configuration dans vite.config.js
4. Contactez : efoka24ops@gmail.com

## 🔄 Mise à jour du projet

```bash
# Tirez les dernières modifications
git pull origin main

# Mettez à jour les dépendances
npm install
cd backend && npm install && cd ..
cd backoffice && npm install && cd ..
```

## 📝 Git workflow

```bash
# Créer une branche
git checkout -b feature/nom-de-la-feature

# Faire des changements et commit
git add .
git commit -m "Description des changements"

# Pousser vers GitHub
git push origin feature/nom-de-la-feature

# Créer une Pull Request sur GitHub
```

---

**Bon développement! 🚀**
