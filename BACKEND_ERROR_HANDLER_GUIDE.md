# 🛠️ Guide d'Intégration - errorHandler.js Backend

**Créé:** Février 2026  
**Fichier:** `backend/middleware/errorHandler.js`  
**Statut:** ✅ Prêt à intégrer

---

## 📋 Contenu du Middleware

Le fichier `errorHandler.js` contient:

```
✅ Middleware principal errorHandler
✅ 7 Classes d'erreurs personnalisées
✅ Utilitaires de conversion/logging
✅ Wrapper async pour les routes
✅ Middleware notFoundHandler
✅ Helpers avancés (validation, permissions, rate limiting)
```

---

## 🔌 Intégration dans server.js

### Étape 1: Importer le middleware

```javascript
// En haut de backend/server.js, ajouter:
const {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ValidationError,
  AuthenticationError,
  SuccessResponse
} = require('./middleware/errorHandler');
```

### Étape 2: Ajouter les middlewares (à la fin)

```javascript
// À la fin de server.js, AVANT app.listen():

// 1. Route 404 (avant le error handler)
app.use(notFoundHandler);

// 2. Middleware d'erreur global (doit être en dernier)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
```

### Exemple complet (server.js)

```javascript
const express = require('express');
const cors = require('cors');
const { errorHandler, notFoundHandler, asyncHandler } = require('./middleware/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// 404 handler
app.use(notFoundHandler);

// Error handler (DOIT être en dernier)
app.use(errorHandler);

app.listen(5000, () => {
  console.log('✅ Server running');
});
```

---

## 📚 Classes d'Erreurs Disponibles

### AppError (Classe de base)
```javascript
new AppError(message, statusCode, errorCode)

// Exemple
throw new AppError('Quelque chose s\'est mal passé', 500, 'GENERIC_ERROR');
```

### ValidationError
```javascript
throw new ValidationError('Données invalides', {
  email: 'Email invalide',
  age: 'L\'âge doit être supérieur à 18'
});
```

### AuthenticationError
```javascript
throw new AuthenticationError('Token requis');
// ou
throw new AuthenticationError(); // Message par défaut
```

### AuthorizationError
```javascript
throw new AuthorizationError('Vous n\'avez pas accès');
```

### NotFoundError
```javascript
throw new NotFoundError('User'); // "User non trouvée"
// ou
throw new NotFoundError(); // "Ressource non trouvée"
```

### ConflictError
```javascript
throw new ConflictError('Email existe déjà', {
  field: 'email',
  existingId: 123
});
```

### RateLimitError
```javascript
throw new RateLimitError('Trop de requêtes');
```

### ServerError
```javascript
throw new ServerError('Erreur interne', originalError);
```

---

## 🎯 Utilisation dans les Routes

### Utiliser asyncHandler pour les routes asynchrones

```javascript
// ❌ Sans asyncHandler (les erreurs ne sont pas catchées)
app.get('/api/users/:id', async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // Si ça throw, l'erreur ne sera pas handlerisée
});

// ✅ Avec asyncHandler (les erreurs sont catchées automatically)
const { asyncHandler } = require('./middleware/errorHandler');

app.get('/api/users/:id', asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new NotFoundError('User');
  res.json({ success: true, data: user });
}));
```

### Lancer des erreurs dans les routes

```javascript
const { asyncHandler, ValidationError, NotFoundError } = require('./middleware/errorHandler');

// Route 1: Validation
app.post('/api/users', asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    throw new ValidationError('Champs obligatoires', {
      name: !name ? 'Requis' : undefined,
      email: !email ? 'Requis' : undefined
    });
  }

  res.json({ success: true, message: 'User créé' });
}));

// Route 2: NotFound
app.get('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await db.users.find(req.params.id);
  if (!user) throw new NotFoundError('User');
  
  res.json({ success: true, data: user });
}));

// Route 3: Utiliser SuccessResponse
app.put('/api/users/:id', asyncHandler(async (req, res) => {
  const user = await db.users.update(req.params.id, req.body);
  
  res.status(200).json({
    success: true,
    message: 'User mis à jour',
    data: user
  });
  // Ou utiliser SuccessResponse:
  // return new SuccessResponse(user, 'User mis à jour').send(res);
}));
```

---

## 🔐 Helpers Avancés

### checkPermission - Vérifier les permissions

```javascript
const { errorHandlers } = require('./middleware/errorHandler');

// Middleware pour vérifier le rôle admin
app.delete('/api/users/:id', 
  errorHandlers.checkPermission('admin'),
  asyncHandler(async (req, res) => {
    // req.user doit exister et avoir role = 'admin'
    await db.users.delete(req.params.id);
    res.json({ success: true });
  })
);
```

### checkResourceExists - Vérifier que la ressource existe

```javascript
const { errorHandlers, asyncHandler } = require('./middleware/errorHandler');

app.get('/api/users/:id',
  errorHandlers.checkResourceExists(async (req) => {
    return await db.users.find(req.params.id);
  }),
  asyncHandler(async (req, res) => {
    // req.resource contient l'utilisateur trouvé
    res.json({ success: true, data: req.resource });
  })
);
```

### handleRateLimit - Limiter le taux de requêtes

```javascript
const { errorHandlers } = require('./middleware/errorHandler');

// Max 10 requêtes par 15 minutes par IP
app.post('/api/auth/login',
  errorHandlers.handleRateLimit(10, 15 * 60 * 1000),
  asyncHandler(async (req, res) => {
    // Login logic
  })
);
```

---

## 📊 Format de Réponse d'Erreur

### En cas d'erreur

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "statusCode": 400,
    "timestamp": "2026-02-05T10:30:00.000Z",
    "details": {
      "email": "Email invalide",
      "age": "L'âge doit être supérieur à 18"
    }
  }
}
```

### En développement (avec stack trace)

```json
{
  "success": false,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Erreur serveur",
    "statusCode": 500,
    "timestamp": "2026-02-05T10:30:00.000Z",
    "stack": "Error: Something went wrong\n    at..."
  }
}
```

---

## 🔍 Logging des Erreurs

Les erreurs sont automatiquement loggées:

### En console (en développement)
```
🚨 ERROR: {
  timestamp: "2026-02-05...",
  level: "ERROR",
  errorCode: "VALIDATION_ERROR",
  message: "Données invalides",
  statusCode: 400,
  method: "POST",
  path: "/api/users",
  userId: "user123",
  details: {...}
}
```

### Dans un fichier (en production)
```javascript
// Si LOG_FILE_PATH est défini dans .env:
// Les logs sont écrits dans le fichier spécifié (JSON Lines)
```

---

## ⚙️ Configuration

### Variables d'environnement (.env)

```bash
# Mode
NODE_ENV=production  # ou development

# Logging
LOG_FILE_PATH=./logs/error.log  # Optionnel

# Rate limiting
RATE_LIMIT_WINDOW=900000  # 15 minutes en ms
RATE_LIMIT_MAX_REQUESTS=100  # Max requêtes
```

---

## 📝 Exemples Complets

### Exemple 1: Gestion CRUD avec validations

```javascript
const { asyncHandler, ValidationError, NotFoundError } = require('./middleware/errorHandler');

// CREATE
app.post('/api/services', asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validation
  if (!name?.trim()) {
    throw new ValidationError('Champs invalides', {
      name: 'Le nom est obligatoire'
    });
  }

  if (name.length < 3) {
    throw new ValidationError('Validation échouée', {
      name: 'Le nom doit avoir au moins 3 caractères'
    });
  }

  // Créer
  const service = await db.services.create({
    name: name.trim(),
    description: description?.trim() || ''
  });

  res.status(201).json({
    success: true,
    message: 'Service créé',
    data: service
  });
}));

// READ
app.get('/api/services/:id', asyncHandler(async (req, res) => {
  const service = await db.services.findById(req.params.id);
  
  if (!service) {
    throw new NotFoundError('Service');
  }

  res.json({
    success: true,
    data: service
  });
}));

// UPDATE
app.put('/api/services/:id', asyncHandler(async (req, res) => {
  const service = await db.services.findById(req.params.id);
  
  if (!service) {
    throw new NotFoundError('Service');
  }

  const updated = await db.services.update(req.params.id, req.body);

  res.json({
    success: true,
    message: 'Service mis à jour',
    data: updated
  });
}));

// DELETE
app.delete('/api/services/:id', asyncHandler(async (req, res) => {
  const service = await db.services.findById(req.params.id);
  
  if (!service) {
    throw new NotFoundError('Service');
  }

  await db.services.delete(req.params.id);

  res.json({
    success: true,
    message: 'Service supprimé'
  });
}));
```

### Exemple 2: Authentification et permissions

```javascript
const { asyncHandler, AuthenticationError, AuthorizationError } = require('./middleware/errorHandler');

// Login
app.post('/api/auth/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await db.users.findByEmail(email);
  if (!user || !verifyPassword(password, user.password)) {
    throw new AuthenticationError('Identifiants incorrects');
  }

  const token = generateToken(user);
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role
    }
  });
}));

// Middleware d'authentification
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    throw new AuthenticationError();
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    throw new AuthenticationError('Token invalide');
  }
}

// Route protégée (admin seulement)
app.delete('/api/users/:id',
  authMiddleware,
  errorHandlers.checkPermission('admin'),
  asyncHandler(async (req, res) => {
    await db.users.delete(req.params.id);
    res.json({ success: true, message: 'User supprimé' });
  })
);
```

---

## ✅ Checklist d'Intégration

- [ ] Fichier `backend/middleware/errorHandler.js` créé
- [ ] Imports ajoutés à `server.js`
- [ ] `notFoundHandler` ajouté avant `errorHandler`
- [ ] `errorHandler` ajouté en dernier middleware
- [ ] Routes testées avec asyncHandler
- [ ] Types d'erreurs utilisés correctement
- [ ] Logging fonctionne
- [ ] Réponses d'erreur cohérentes
- [ ] Permissions vérifiées sur routes sensibles
- [ ] Rate limiting sur authentification

---

## 🆘 Dépannage

### Erreur: "errorHandler is not a function"
```javascript
// Vérifier l'import
const { errorHandler } = require('./middleware/errorHandler');
// Pas de destructuring par défaut - doit être nommé
```

### Erreurs non catchées
```javascript
// Vérifier que asyncHandler est utilisé
app.get('/api/test', asyncHandler(async (req, res) => {
  // errorHandler doit encapsuler
}));
```

### ErrorHandler ne catch pas les erreurs
```javascript
// Vérifier qu'il est en DERNIER
app.use(notFoundHandler); // 1er
app.use(errorHandler);    // 2e (doit être en dernier)
```

---

## 📚 Ressources

- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [Node.js Error Handling](https://nodejs.org/en/docs/guides/nodejs-error-handling/)

---

*Guide d'intégration - errorHandler.js - TRU GROUP Backend*
