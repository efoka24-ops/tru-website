/**
 * 🐛 Service de Résolution de Bugs - BugSolver
 * Analyse automatiquement les erreurs et propose des solutions intelligentes
 * 
 * Fonctionnalités:
 * - Détection de patterns d'erreurs
 * - Solutions priorisées par criticité
 * - Suggestions progressives (basique → avancé)
 * - Intégration avec le système de logging
 * 
 * Usage:
 * import { analyzeBugAndSuggestSolution } from './bugSolver';
 * const suggestions = analyzeBugAndSuggestSolution(errorLog);
 */

// Catalogue des patterns d'erreurs connus et leurs solutions
const BUG_PATTERNS = [
  {
    name: 'Image trop volumineuse',
    patterns: [
      /image.*trop.*volumineux/i,
      /file.*too.*large/i,
      /size.*exceed/i,
      /250kb/i
    ],
    solutions: [
      {
        title: '📷 Compresser l\'image',
        description: 'Utilisez un outil en ligne comme TinyPNG ou Compressor.io pour réduire la taille du fichier à moins de 250KB',
        steps: [
          'Ouvrez https://tinypng.com',
          'Téléchargez votre image',
          'Téléchargez l\'image compressée',
          'Essayez à nouveau avec la nouvelle image'
        ],
        priority: 'HIGH'
      },
      {
        title: '⚙️ Augmenter la limite backend',
        description: 'Modifier la limite d\'upload côté backend (server.js)',
        steps: [
          'Ouvrir backend/server.js',
          'Chercher: if (req.body.image.length > 250 * 1024)',
          'Changer 250 par 500 (pour 500KB)',
          'Redéployer le backend'
        ],
        priority: 'MEDIUM'
      },
      {
        title: '🖼️ Utiliser des URLs au lieu de base64',
        description: 'Stocker les URLs d\'images au lieu d\'encodage base64',
        steps: [
          'Modifier handlePhotoUpload pour accepter des URLs',
          'Utiliser un service de stockage (Cloudinary, AWS S3)',
          'Réduire la taille des payloads'
        ],
        priority: 'LOW'
      }
    ]
  },
  {
    name: 'Erreur de connexion backend',
    patterns: [
      /connect.*econnrefused/i,
      /backend.*not.*available/i,
      /cannot.*reach.*backend/i,
      /econnrefused.*5000/i
    ],
    solutions: [
      {
        title: '🔌 Vérifier que le backend est démarré',
        description: 'Le serveur backend doit être en cours d\'exécution',
        steps: [
          'Ouvrir un terminal dans backend/',
          'Lancer: npm start',
          'Vérifier le message: "✅ Server running on port 5000"'
        ],
        priority: 'HIGH'
      },
      {
        title: '🌐 Vérifier l\'URL du backend',
        description: 'Vérifier que la configuration pointe vers le bon backend',
        steps: [
          'En production: https://tru-backend-o1zc.onrender.com',
          'En local: http://localhost:5000',
          'Vérifier dans .env ou config/apiConfig.js'
        ],
        priority: 'HIGH'
      },
      {
        title: '🚀 Réveiller le backend Render',
        description: 'Les services gratuits Render s\'endorment après inactivité',
        steps: [
          'Visiter: https://tru-backend-o1zc.onrender.com/api/health',
          'Attendre 30-60 secondes pour le démarrage',
          'Essayer à nouveau'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur d\'authentification',
    patterns: [
      /unauthorized/i,
      /authentication.*failed/i,
      /invalid.*token/i,
      /401|403/i
    ],
    solutions: [
      {
        title: '🔐 Se reconnecter',
        description: 'Le token d\'authentification a peut-être expiré',
        steps: [
          'Cliquer sur "Se déconnecter" en haut à droite',
          'Se reconnecter avec vos identifiants',
          'Essayer l\'opération à nouveau'
        ],
        priority: 'HIGH'
      },
      {
        title: '🗑️ Effacer le cache du navigateur',
        description: 'Les données locales peuvent être corrompues',
        steps: [
          'Ouvrir DevTools (F12)',
          'Aller à Application → Local Storage',
          'Supprimer toutes les entrées du domaine',
          'Actualiser la page'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur de validation',
    patterns: [
      /validation.*failed/i,
      /required.*field/i,
      /invalid.*format/i
    ],
    solutions: [
      {
        title: '✅ Vérifier les champs obligatoires',
        description: 'Tous les champs marqués comme obligatoires doivent être remplis',
        steps: [
          'Nom: doit être non vide',
          'Fonction: doit être non vide',
          'Photo: doit être < 250KB',
          'Vérifier qu\'aucun champ n\'est vide'
        ],
        priority: 'HIGH'
      }
    ]
  },
  {
    name: 'Erreur de synchronisation',
    patterns: [
      /sync.*failed/i,
      /synchronization.*error/i,
      /cannot.*sync/i
    ],
    solutions: [
      {
        title: '🔄 Réessayer la synchronisation',
        description: 'Les erreurs de réseau peuvent être temporaires',
        steps: [
          'Cliquer sur "Actualiser" dans la page',
          'Attendre 5 secondes',
          'Essayer à nouveau'
        ],
        priority: 'MEDIUM'
      },
      {
        title: '🌐 Vérifier la connexion Internet',
        description: 'Une mauvaise connexion peut causer des erreurs',
        steps: [
          'Vérifier que vous êtes connecté à Internet',
          'Essayer d\'accéder à un autre site',
          'Redémarrer votre routeur si nécessaire'
        ],
        priority: 'HIGH'
      }
    ]
  },
  {
    name: 'Erreur de chargement des données',
    patterns: [
      /failed.*load/i,
      /cannot.*fetch/i,
      /data.*unavailable/i,
      /load.*error/i
    ],
    solutions: [
      {
        title: '🔄 Actualiser la page',
        description: 'Recharger peut résoudre les problèmes temporaires',
        steps: [
          'Appuyer sur F5 ou Ctrl+R',
          'Attendre le chargement',
          'Si toujours erreur, continuer'
        ],
        priority: 'HIGH'
      },
      {
        title: '🗑️ Vider le cache',
        description: 'Les données en cache peuvent être périmées',
        steps: [
          'DevTools → Application → Cache Storage',
          'Supprimer tous les caches du domaine',
          'Actualiser'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  // ============ NOUVEAUX PATTERNS AJOUTÉS ============
  {
    name: 'Erreur CORS (Cross-Origin)',
    patterns: [
      /cors/i,
      /access.*origin/i,
      /cross.*origin.*request.*blocked/i,
      /no.*access.*control.*allow.*origin/i
    ],
    solutions: [
      {
        title: '🔧 Vérifier la configuration CORS',
        description: 'Le serveur backend doit autoriser les requêtes cross-origin',
        steps: [
          'Ouvrir backend/server.js',
          'Vérifier que cors est activé: app.use(cors())',
          'S\'assurer que FRONTEND_URL est correcte dans .env',
          'Redémarrer le serveur'
        ],
        priority: 'HIGH'
      },
      {
        title: '📍 Vérifier les URLs domaine',
        description: 'Assurez-vous que les domaines sont configurés correctement',
        steps: [
          'Frontend URL: https://fo.trugroup.cm (ou localhost:5176)',
          'Backoffice URL: https://bo.trugroup.cm (ou localhost:3001)',
          'Backend URL: https://tru-backend-o1zc.onrender.com (ou localhost:5000)',
          'Vérifier dans .env ou config'
        ],
        priority: 'HIGH'
      }
    ]
  },
  {
    name: 'Erreur de formatage JSON',
    patterns: [
      /json.*parse/i,
      /unexpected.*token/i,
      /invalid.*json/i,
      /syntaxerror.*json/i
    ],
    solutions: [
      {
        title: '🔍 Vérifier le format JSON',
        description: 'La réponse du serveur n\'est pas un JSON valide',
        steps: [
          'Ouvrir DevTools (F12)',
          'Aller à Network',
          'Chercher la requête qui échoue',
          'Vérifier la réponse - elle doit commencer par { ou ['
        ],
        priority: 'HIGH'
      },
      {
        title: '🛠️ Vérifier le Content-Type',
        description: 'Backend doit retourner application/json',
        steps: [
          'Ouvrir DevTools → Network → Headers',
          'Vérifier: Content-Type: application/json',
          'Si application/text ou autre, modifier le serveur'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Token expiré ou invalide',
    patterns: [
      /token.*expired/i,
      /invalid.*token/i,
      /jwt.*error/i,
      /unauthorized.*token/i
    ],
    solutions: [
      {
        title: '🔐 Se reconnecter',
        description: 'Votre session a expiré',
        steps: [
          'Cliquer sur le menu utilisateur',
          'Sélectionner "Déconnexion"',
          'Vous reconnecter avec vos identifiants',
          'Réessayer l\'opération'
        ],
        priority: 'HIGH'
      },
      {
        title: '🧹 Nettoyer le localStorage',
        description: 'Supprimer les tokens corrompus',
        steps: [
          'Ouvrir DevTools (F12)',
          'Console → window.localStorage.clear()',
          'Actualiser la page (F5)',
          'Se reconnecter'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur de base de données',
    patterns: [
      /database.*error/i,
      /db.*error/i,
      /query.*failed/i,
      /table.*not.*found/i
    ],
    solutions: [
      {
        title: '🗄️ Vérifier la base de données',
        description: 'Backend ne peut pas accéder à la base de données',
        steps: [
          'Aller à backend/',
          'Vérifier que data.json existe',
          'Si absent, lancer: node init-db.cjs',
          'Redémarrer le serveur'
        ],
        priority: 'HIGH'
      },
      {
        title: '💾 Restaurer depuis backup',
        description: 'Si data.json est corrompu',
        steps: [
          'Aller à backend/backups/',
          'Chercher la sauvegarde la plus récente',
          'Copier son contenu dans data.json',
          'Redémarrer le serveur'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur de permission (403)',
    patterns: [
      /forbidden/i,
      /access.*denied/i,
      /permission.*denied/i,
      /403|permission/i
    ],
    solutions: [
      {
        title: '👤 Vérifier votre rôle',
        description: 'Vous n\'avez peut-être pas les permissions',
        steps: [
          'Contacter l\'administrateur',
          'Demander les permissions nécessaires',
          'Vous reconnecter après mise à jour'
        ],
        priority: 'HIGH'
      },
      {
        title: '🔐 Vérifier l\'authentification',
        description: 'Votre token doit être valide',
        steps: [
          'DevTools → Application → Local Storage',
          'Chercher "auth-token" ou similaire',
          'S\'il absent/vide: se reconnecter',
          'Réessayer'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur de mémoire ou performance',
    patterns: [
      /out.*of.*memory/i,
      /memory.*exceeded/i,
      /heap.*out.*of.*memory/i,
      /timeout/i,
      /taking.*too.*long/i
    ],
    solutions: [
      {
        title: '⚡ Réduire la quantité de données',
        description: 'Charger trop de données à la fois',
        steps: [
          'Utiliser la pagination (charger par 20)',
          'Ajouter des filtres pour réduire les résultats',
          'Charger les données au fur et à mesure (lazy load)'
        ],
        priority: 'HIGH'
      },
      {
        title: '🔄 Optimiser les requêtes',
        description: 'Les requêtes prennent trop de temps',
        steps: [
          'Réduire le nombre de requêtes simultanées',
          'Ajouter des indexes à la base de données',
          'Utiliser du caching côté frontend'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Fichier/Upload non valide',
    patterns: [
      /file.*invalid/i,
      /upload.*failed/i,
      /unsupported.*format/i,
      /extension.*not.*allowed/i,
      /mime.*type/i
    ],
    solutions: [
      {
        title: '📁 Vérifier le format du fichier',
        description: 'Le fichier doit être du format accepté',
        steps: [
          'Formats acceptés: JPG, PNG, GIF',
          'Formats refusés: BMP, TIFF, RAW, etc.',
          'Convertir à PNG/JPG si besoin (Online-convert.com)',
          'Retenter l\'upload'
        ],
        priority: 'HIGH'
      },
      {
        title: '📏 Vérifier la taille du fichier',
        description: 'Le fichier dépasse la limite de taille',
        steps: [
          'Limite actuelle: 250 KB (ou 5 MB selon config)',
          'Compresser l\'image (tinypng.com)',
          'Retenter l\'upload'
        ],
        priority: 'HIGH'
      }
    ]
  },
  {
    name: 'Conflit de données (409)',
    patterns: [
      /conflict/i,
      /already.*exists/i,
      /duplicate/i,
      /409/i
    ],
    solutions: [
      {
        title: '↪️ Vérifier les doublons',
        description: 'Cette données existe déjà',
        steps: [
          'Vérifier que les informations sont uniques',
          'Email déjà utilisé? Utiliser un autre',
          'Nom déjà existant? Ajouter un suffixe'
        ],
        priority: 'HIGH'
      },
      {
        title: '🔄 Actualiser et réessayer',
        description: 'Peut-être une synchronisation en retard',
        steps: [
          'Actualiser la page (F5)',
          'Attendre 2-3 secondes',
          'Réessayer la même opération'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur réseau générique',
    patterns: [
      /network.*error/i,
      /failed.*network/i,
      /connection.*refused/i,
      /timeout/i
    ],
    solutions: [
      {
        title: '📡 Vérifier votre connexion',
        description: 'Problème de connexion Internet',
        steps: [
          'Vérifier que vous êtes connecté (WiFi/Ethernet)',
          'Essayer d\'ouvrir un autre site',
          'Redémarrer votre routeur si nécessaire',
          'Essayer avec Mobile data si disponible'
        ],
        priority: 'HIGH'
      },
      {
        title: '🔌 Vérifier les serveurs',
        description: 'Les serveurs peuvent être down',
        steps: [
          'Visiter: https://status.render.com (backend)',
          'Chercher "tru-backend" dans les incidents',
          'S\'il en incident, attendre qu\'il soit résolu',
          'Ouvrir un ticket support si persistant'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur TypeScript ou Module',
    patterns: [
      /module.*not.*found/i,
      /cannot.*find.*module/i,
      /type.*error/i,
      /is.*not.*assignable/i
    ],
    solutions: [
      {
        title: '📦 Réinstaller les dépendances',
        description: 'Modules manquants ou corrompus',
        steps: [
          'Ouvrir le terminal',
          'Naviguer au dossier du projet',
          'Lancer: npm install',
          'Attendre la fin et redémarrer'
        ],
        priority: 'HIGH'
      },
      {
        title: '🗑️ Nettoyer le cache npm',
        description: 'Cache npm peut être corrompu',
        steps: [
          'Terminal: npm cache clean --force',
          'Supprimer node_modules: rm -rf node_modules',
          'Supprimer package-lock.json',
          'Relancer: npm install'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur dans une fonction',
    patterns: [
      /cannot.*read.*property/i,
      /undefined.*is.*not.*a.*function/i,
      /is.*not.*a.*function/i,
      /typeerror/i
    ],
    solutions: [
      {
        title: '🔍 Vérifier les données',
        description: 'Une variable n\'existe pas ou est undefined',
        steps: [
          'Ouvrir DevTools (F12) → Console',
          'Chercher les messages d\'erreur rouge',
          'Vérifier que les données sont charger avant utilisation',
          'Ajouter des vérifications null/undefined'
        ],
        priority: 'HIGH'
      },
      {
        title: '🐛 Déboguer pas à pas',
        description: 'Trouver exactement où l\'erreur survient',
        steps: [
          'DevTools → Sources',
          'Placer un breakpoint sur la ligne d\'erreur (cliquer numéro ligne)',
          'Rafraîchir (F5)',
          'Examiner les variables quand ça s\'arrête'
        ],
        priority: 'MEDIUM'
      }
    ]
  },
  {
    name: 'Erreur de déploiement',
    patterns: [
      /deployment.*failed/i,
      /build.*error/i,
      /deploy.*error/i,
      /github.*action.*failed/i
    ],
    solutions: [
      {
        title: '📋 Vérifier les logs GitHub',
        description: 'Voir quel est l\'erreur exacte du build',
        steps: [
          'Aller au repo GitHub',
          'Actions → dernier build',
          'Chercher la sectio "X job failed"',
          'Lire les logs pour voir l\'erreur'
        ],
        priority: 'HIGH'
      },
      {
        title: '🔧 Vérifier les variables d\'environnement',
        description: 'Les secrets peuvent manquer sur le serveur',
        steps: [
          'Pour Netlify: Settings → Build & deploy → Environment',
          'Pour Render: Settings → Environment',
          'Ajouter/vérifier toutes les variables requises',
          'Retrigger le déploiement'
        ],
        priority: 'HIGH'
      }
    ]
  }
];

/**
 * Analyser un log et proposer des solutions
 */
export function analyzeBugAndSuggestSolution(log) {
  if (log.level !== 'ERROR' && log.level !== 'WARN') {
    return null;
  }

  const message = (log.message || '').toLowerCase();
  const dataStr = (JSON.stringify(log.data || {})).toLowerCase();
  const fullText = `${message} ${dataStr}`;

  for (const pattern of BUG_PATTERNS) {
    for (const regex of pattern.patterns) {
      if (regex.test(fullText)) {
        return {
          bugType: pattern.name,
          solutions: pattern.solutions,
          matchedPattern: regex.source,
          logId: `${log.timestamp}-${log.message}`
        };
      }
    }
  }

  return null;
}

/**
 * Obtenir la priorité d'une solution
 */
export function getPrioritySortOrder(priority) {
  const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
  return order[priority] ?? 3;
}

/**
 * Formatter une solution pour l'affichage
 */
export function formatSolution(solution) {
  return {
    ...solution,
    priorityColor: {
      HIGH: 'bg-red-100 text-red-700 border-red-300',
      MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      LOW: 'bg-blue-100 text-blue-700 border-blue-300'
    }[solution.priority] || 'bg-gray-100',
    priorityLabel: {
      HIGH: '🔴 Critique',
      MEDIUM: '🟡 Important',
      LOW: '🔵 Faible'
    }[solution.priority] || 'Inconnu'
  };
}

/**
 * Grouper les solutions par criticité
 */
export function groupSolutionsByPriority(solutions) {
  const grouped = {
    HIGH: [],
    MEDIUM: [],
    LOW: []
  };

  solutions.forEach(solution => {
    if (grouped[solution.priority]) {
      grouped[solution.priority].push(solution);
    }
  });

  return grouped;
}

/**
 * Obtenir la première solution recommandée
 */
export function getRecommendedSolution(solutions) {
  if (!solutions || solutions.length === 0) return null;
  return solutions.sort((a, b) => getPrioritySortOrder(a.priority) - getPrioritySortOrder(b.priority))[0];
}

/**
 * Analyser plusieurs logs et synthétiser les résultats
 */
export function analyzeManyLogsAndSynthesizeIssues(logs) {
  const issues = new Map();

  logs.forEach(log => {
    const suggestion = analyzeBugAndSuggestSolution(log);
    if (suggestion) {
      const key = suggestion.bugType;
      if (!issues.has(key)) {
        issues.set(key, {
          bugType: suggestion.bugType,
          count: 0,
          solutions: suggestion.solutions,
          lastOccurrence: log.timestamp,
          logs: []
        });
      }

      const issue = issues.get(key);
      issue.count++;
      issue.lastOccurrence = log.timestamp;
      issue.logs.push(log);
    }
  });

  return Array.from(issues.values())
    .sort((a, b) => b.count - a.count);
}

/**
 * Détection de patterns récurrents
 */
export function detectRecurrentPatterns(logs, minOccurrences = 3) {
  const patterns = new Map();

  logs.forEach(log => {
    const suggestion = analyzeBugAndSuggestSolution(log);
    if (suggestion) {
      const key = suggestion.bugType;
      patterns.set(key, (patterns.get(key) || 0) + 1);
    }
  });

  return Array.from(patterns.entries())
    .filter(([_, count]) => count >= minOccurrences)
    .map(([bugType, count]) => ({
      bugType,
      occurrences: count,
      percentage: (count / logs.length * 100).toFixed(1)
    }))
    .sort((a, b) => b.occurrences - a.occurrences);
}

/**
 * Suggérer des améliorations système basé sur les patterns
 */
export function suggestSystemImprovements(logs) {
  const patterns = detectRecurrentPatterns(logs, 1);
  const suggestions = [];

  const improvements = {
    'Image trop volumineuse': {
      title: '📷 Mettre en place compression d\'images',
      description: 'Trop d\'erreurs upload. Implémenter la compression automatique.',
      effort: 'MEDIUM',
      impact: 'HIGH'
    },
    'Erreur de connexion backend': {
      title: '🔌 Monitorer la disponibilité backend',
      description: 'Implémenter health checks et alertes Render.',
      effort: 'LOW',
      impact: 'MEDIUM'
    },
    'Token expiré ou invalide': {
      title: '🔐 Implémenter token refresh automatique',
      description: 'Renouveler les tokens avant expiration.',
      effort: 'MEDIUM',
      impact: 'HIGH'
    },
    'Erreur réseau générique': {
      title: '🔄 Ajouter retry automatiqu avec backoff',
      description: 'Réessayer automatiquement les requêtes échouées.',
      effort: 'MEDIUM',
      impact: 'HIGH'
    },
    'Erreur CORS': {
      title: '🛡️ Ajouter proxy middleware',
      description: 'Utiliser un proxy pour éviter les problèmes CORS.',
      effort: 'LOW',
      impact: 'MEDIUM'
    }
  };

  patterns.forEach(pattern => {
    if (improvements[pattern.bugType]) {
      suggestions.push({
        ...improvements[pattern.bugType],
        occurrences: pattern.occurrences,
        bugType: pattern.bugType
      });
    }
  });

  return suggestions.sort((a, b) => {
    const impactOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });
}

/**
 * Générer un rapport résumé
 */
export function generateBugSolverReport(logs) {
  const report = {
    totalLogs: logs.length,
    errorCount: logs.filter(l => l.level === 'ERROR').length,
    warningCount: logs.filter(l => l.level === 'WARN').length,
    patterns: detectRecurrentPatterns(logs, 1),
    topIssues: analyzeManyLogsAndSynthesizeIssues(logs).slice(0, 5),
    suggestions: suggestSystemImprovements(logs),
    generatedAt: new Date().toISOString()
  };

  return report;
}

/**
 * Exporter les solutions au format JSON pour sauvegarde
 */
export function exportSolutionsAsJSON(suggestion) {
  return {
    bugType: suggestion.bugType,
    solutions: suggestion.solutions.map(s => formatSolution(s)),
    exportDate: new Date().toISOString()
  };
}

/**
 * Trouver un pattern d'erreur spécifique
 */
export function findBugPatternByName(bugName) {
  return BUG_PATTERNS.find(p => p.name.toLowerCase().includes(bugName.toLowerCase()));
}

/**
 * Lister tous les types de bugs connus
 */
export function listAllBugTypes() {
  return BUG_PATTERNS.map(p => ({
    name: p.name,
    solutionCount: p.solutions.length,
    patterns: p.patterns.map(p => p.source)
  }));
}

export default {
  analyzeBugAndSuggestSolution,
  getPrioritySortOrder,
  formatSolution,
  groupSolutionsByPriority,
  getRecommendedSolution,
  analyzeManyLogsAndSynthesizeIssues,
  detectRecurrentPatterns,
  suggestSystemImprovements,
  generateBugSolverReport,
  exportSolutionsAsJSON,
  findBugPatternByName,
  listAllBugTypes
};
