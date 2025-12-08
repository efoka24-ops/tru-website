// Ce fichier crée des endpoints API virtuel dans le Frontend
// pour servir les données de l'équipe depuis content.js

import { team, services, solutions } from '../data/content.js';

// NOTE: Ce fichier est un fallback pour le développement local
// En production, le backoffice communique directement avec le backend sur le port 5000
// Ces fonctions ne sont utilisées que si le backend n'est pas disponible

export const setupFrontendAPI = () => {
  // Cette fonction n'est plus nécessaire car le backoffice utilise le backend réel
  console.log('Frontend API setup (fallback mode)');
};

export { team, services, solutions };
