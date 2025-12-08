/**
 * Configuration des services API
 * À adapter selon votre environnement
 */

// URLs des services
export const API_CONFIG = {
  // Environnement de développement
  development: {
    // Backoffice
    backofficeApi: 'http://localhost:3001/api',
    
    // Frontend Admin TRU
    frontendAdminApi: 'http://localhost:5173/api',
    
    // Site TRU Principal
    truSiteApi: 'http://localhost:3000/api',
    
    // Backend API
    backendApi: 'http://localhost:4000/api',
  },

  // Environnement de production
  production: {
    backofficeApi: 'https://backoffice.trugroup.cm/api',
    frontendAdminApi: 'https://admin.trugroup.cm/api',
    truSiteApi: 'https://trugroup.cm/api',
    backendApi: 'https://api.trugroup.cm/api',
  },

  // Environnement de staging
  staging: {
    backofficeApi: 'https://staging-backoffice.trugroup.cm/api',
    frontendAdminApi: 'https://staging-admin.trugroup.cm/api',
    truSiteApi: 'https://staging.trugroup.cm/api',
    backendApi: 'https://staging-api.trugroup.cm/api',
  },
};

// Fonction pour obtenir la configuration actuelle
export const getAPIConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  const nodeEnv = process.env.VITE_API_ENV || env;
  
  return API_CONFIG[nodeEnv] || API_CONFIG.development;
};

// Fonction pour créer les URLs
export const getTeamApiUrl = (endpoint) => {
  const config = getAPIConfig();
  
  switch (endpoint) {
    case 'backoffice':
      return config.backofficeApi;
    case 'admin':
      return config.frontendAdminApi;
    case 'site':
      return config.truSiteApi;
    case 'backend':
      return config.backendApi;
    default:
      return config.truSiteApi;
  }
};

// Configuration de fetch par défaut
export const fetchConfig = {
  headers: {
    'Content-Type': 'application/json',
    'X-App-Version': '1.0.0',
  },
  timeout: 30000, // 30 secondes
};

// Fonction helper pour fetch avec timeout
export const fetchWithTimeout = async (url, options = {}, timeout = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchConfig,
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout (${timeout}ms)`);
    }
    throw error;
  }
};

// Export par défaut
export default {
  API_CONFIG,
  getAPIConfig,
  getTeamApiUrl,
  fetchWithTimeout,
};
