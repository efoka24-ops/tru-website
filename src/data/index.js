/**
 * Point d'entrée centralisé pour les imports de données
 * Facilite les imports et maintient la cohérence
 */

export { siteSettings, navItems, services, solutions, testimonials, stats } from './content';
export { colors, colorUtils } from './colors';
export { getAllBackendData, syncDataWithBackend } from './backendData';

// Exports particuliers
export { default as colorPalette } from './colors';
