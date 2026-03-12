/**
 * 🚨 Middleware de Gestion Centralisée des Erreurs
 * Gère tous les types d'erreurs et retourne des réponses cohérentes
 * 
 * Utilisation:
 * app.use(errorHandler);
 */

// Types d'erreurs personnalisées
class AppError extends Error {
  constructor(message, statusCode, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AppError {
  constructor(message, details = {}) {
    super(message, 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentification requise') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Accès non autorisé') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

class NotFoundError extends AppError {
  constructor(resource = 'Ressource') {
    super(`${resource} non trouvée`, 404, 'NOT_FOUND');
  }
}

class ConflictError extends AppError {
  constructor(message, details = {}) {
    super(message, 409, 'CONFLICT_ERROR');
    this.details = details;
  }
}

class RateLimitError extends AppError {
  constructor(message = 'Trop de requêtes') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

class ServerError extends AppError {
  constructor(message = 'Erreur serveur interne', originalError = null) {
    super(message, 500, 'INTERNAL_SERVER_ERROR');
    this.originalError = originalError?.message || originalError;
  }
}

/**
 * Convertir les erreurs Node.js en AppError
 */
function convertToAppError(error) {
  // Erreurs de validation Mongoose
  if (error.name === 'ValidationError') {
    const details = Object.keys(error.errors).reduce((acc, key) => {
      acc[key] = error.errors[key].message;
      return acc;
    }, {});
    return new ValidationError('Erreur de validation des données', details);
  }

  // Erreurs de Cast Mongoose
  if (error.name === 'CastError') {
    return new ValidationError(`Format invalide pour le champ ${error.path}`);
  }

  // Erreurs de fichier non trouvé
  if (error.code === 'ENOENT') {
    return new NotFoundError('Fichier');
  }

  // Erreurs de permission
  if (error.code === 'EACCES') {
    return new AuthorizationError('Permission refusée');
  }

  // Erreurs de limite de fichier
  if (error.message?.includes('File size')) {
    return new ValidationError('Fichier trop volumineux');
  }

  // Erreurs JSON
  if (error instanceof SyntaxError && error.status === 400) {
    return new ValidationError('JSON invalide dans le corps de la requête');
  }

  // Erreurs timeout
  if (error.code === 'ETIMEDOUT' || error.code === 'ESOCKETTIMEDOUT') {
    return new ServerError('Délai d\'attente dépassé');
  }

  // Retourner l'erreur si elle est déjà une AppError
  if (error instanceof AppError) {
    return error;
  }

  // Erreur par défaut
  return new ServerError(error.message || 'Erreur interne du serveur', error);
}

/**
 * Logger les erreurs
 */
function logError(error, request = null) {
  const timestamp = new Date().toISOString();
  const method = request?.method || 'UNKNOWN';
  const path = request?.path || 'UNKNOWN';
  const userId = request?.user?.id || 'ANONYMOUS';

  const logEntry = {
    timestamp,
    level: 'ERROR',
    errorCode: error.errorCode || 'UNKNOWN',
    message: error.message,
    statusCode: error.statusCode || 500,
    method,
    path,
    userId,
    stack: error.stack,
    details: error.details || {},
    originalError: error.originalError
  };

  // Console en développement
  if (process.env.NODE_ENV !== 'production') {
    console.error('🚨 ERROR:', JSON.stringify(logEntry, null, 2));
  }

  // Fichier en production (optionnel)
  if (process.env.LOG_FILE_PATH) {
    try {
      const fs = require('fs');
      fs.appendFileSync(
        process.env.LOG_FILE_PATH,
        JSON.stringify(logEntry) + '\n'
      );
    } catch (logError) {
      console.error('❌ Erreur écriture log:', logError);
    }
  }

  return logEntry;
}

/**
 * Middleware de gestion des erreurs
 * Doit être utilisé APRÈS tous les autres middlewares et routes
 */
function errorHandler(err, req, res, next) {
  // Convertir l'erreur en AppError si nécessaire
  const appError = convertToAppError(err);

  // Logger l'erreur
  const logEntry = logError(appError, req);

  // Déterminer la réponse à envoyer
  const statusCode = appError.statusCode || 500;
  const response = {
    success: false,
    error: {
      code: appError.errorCode,
      message: appError.message,
      statusCode: statusCode,
      timestamp: appError.timestamp,
      ...(process.env.NODE_ENV === 'development' && { details: appError.details }),
      ...(process.env.NODE_ENV === 'development' && { stack: appError.stack })
    }
  };

  // Ajouter des détails si disponibles
  if (appError.details && Object.keys(appError.details).length > 0) {
    response.error.details = appError.details;
  }

  // Envoyer la réponse
  res.status(statusCode).json(response);
}

/**
 * Wrapper pour les routes asynchrones
 * Utilisation: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Middleware pour les routes non trouvées
 */
function notFoundHandler(req, res, next) {
  const error = new NotFoundError(`Route ${req.method} ${req.path}`);
  next(error);
}

/**
 * Classe pour les réponses réussies
 */
class SuccessResponse {
  constructor(data, message = 'Opération réussie', statusCode = 200) {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }

  send(res) {
    return res.status(this.statusCode).json({
      success: true,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp
    });
  }
}

/**
 * Middleware pour les requêtes valides avant les erreurs
 */
function validateRequest(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.reduce((acc, detail) => {
        acc[detail.path.join('.')] = detail.message;
        return acc;
      }, {});
      return next(new ValidationError('Données invalides', details));
    }

    req.body = value;
    next();
  };
}

/**
 * Utilitaires helpers pour les routes
 */
const errorHandlers = {
  /**
   * Vérifier la permission utilisateur
   */
  checkPermission: (requiredRole) => {
    return (req, res, next) => {
      if (!req.user) {
        return next(new AuthenticationError());
      }
      if (req.user.role !== requiredRole) {
        return next(new AuthorizationError());
      }
      next();
    };
  },

  /**
   * Vérifier que la ressource existe
   */
  checkResourceExists: (resourceGetter) => {
    return asyncHandler(async (req, res, next) => {
      const resource = await resourceGetter(req);
      if (!resource) {
        throw new NotFoundError('Ressource');
      }
      req.resource = resource;
      next();
    });
  },

  /**
   * Handle rate limiting
   */
  handleRateLimit: (limit = 100, windowMs = 15 * 60 * 1000) => {
    const requests = new Map();

    return (req, res, next) => {
      const key = `${req.ip}:${req.path}`;
      const now = Date.now();
      const userRequests = requests.get(key) || [];

      // Nettoyer les anciennes requêtes
      const recentRequests = userRequests.filter(time => now - time < windowMs);

      if (recentRequests.length >= limit) {
        const retryAfter = Math.ceil((recentRequests[0] + windowMs - now) / 1000);
        res.set('Retry-After', retryAfter);
        return next(new RateLimitError(
          `Trop de requêtes. Réessayez dans ${retryAfter}s`
        ));
      }

      recentRequests.push(now);
      requests.set(key, recentRequests);

      // Nettoyer la map occasionnellement
      if (requests.size > 1000) {
        for (const [k, v] of requests) {
          if (v.filter(time => now - time < windowMs).length === 0) {
            requests.delete(k);
          }
        }
      }

      next();
    };
  }
};

// Exports
module.exports = {
  // Middleware
  errorHandler,
  notFoundHandler,
  asyncHandler,
  validateRequest,

  // Erreurs personnalisées
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,

  // Utilitaires
  SuccessResponse,
  convertToAppError,
  logError,
  errorHandlers
};
