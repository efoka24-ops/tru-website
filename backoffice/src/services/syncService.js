/**
 * Service de synchronisation intelligent
 * Détecte et résout les incohérences entre frontend et backend
 */

import { logger } from './logger';

class SyncService {
  constructor() {
    this.backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://tru-backend-o1zc.onrender.com';
    this.syncInProgress = false;
  }

  /**
   * Comparer les données entre deux sources
   */
  compareData(frontendData, backendData) {
    const differences = [];

    // Vérifier les éléments dans frontend mais pas dans backend
    frontendData.forEach(item => {
      const backendItem = backendData.find(b => b.id === item.id);
      if (!backendItem) {
        differences.push({
          type: 'MISSING_IN_BACKEND',
          id: item.id,
          name: item.name,
          frontendData: item,
          backendData: null,
          severity: 'HIGH'
        });
      } else if (!this.isEqual(item, backendItem)) {
        differences.push({
          type: 'MISMATCH',
          id: item.id,
          name: item.name,
          frontendData: item,
          backendData: backendItem,
          differences: this.findDifferences(item, backendItem),
          severity: 'MEDIUM'
        });
      }
    });

    // Vérifier les éléments dans backend mais pas dans frontend
    backendData.forEach(item => {
      const frontendItem = frontendData.find(f => f.id === item.id);
      if (!frontendItem) {
        differences.push({
          type: 'MISSING_IN_FRONTEND',
          id: item.id,
          name: item.name,
          frontendData: null,
          backendData: item,
          severity: 'MEDIUM'
        });
      }
    });

    return differences;
  }

  /**
   * Vérifier l'égalité entre deux objets (ignorer certains champs)
   */
  isEqual(obj1, obj2) {
    const ignoreFields = ['receivedAt', 'createdAt', 'updatedAt', 'timestamp'];
    
    const keys1 = Object.keys(obj1).filter(k => !ignoreFields.includes(k));
    const keys2 = Object.keys(obj2).filter(k => !ignoreFields.includes(k));

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        return false;
      }
    }

    return true;
  }

  /**
   * Trouver les différences spécifiques entre deux objets
   */
  findDifferences(obj1, obj2) {
    const differences = [];
    const allKeys = new Set([
      ...Object.keys(obj1),
      ...Object.keys(obj2)
    ]);

    allKeys.forEach(key => {
      const val1 = obj1[key];
      const val2 = obj2[key];

      if (JSON.stringify(val1) !== JSON.stringify(val2)) {
        differences.push({
          field: key,
          frontendValue: val1,
          backendValue: val2
        });
      }
    });

    return differences;
  }

  /**
   * Synchroniser un élément vers le backend
   */
  async syncToBackend(data) {
    logger.info(`Synchronisation vers backend: ${data.name}`, { id: data.id });
    
    try {
      const response = await fetch(`${this.backendUrl}/api/team/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      logger.success(`Synchronisation réussie vers backend: ${data.name}`, { id: data.id });
      return {
        success: true,
        message: `✅ ${data.name} synchronisé vers le backend`,
        data: await response.json()
      };
    } catch (error) {
      logger.error(`Erreur synchronisation backend: ${data.name}`, { error: error.message });
      return {
        success: false,
        message: `❌ Erreur: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Créer l'élément dans le backend
   */
  async createInBackend(data) {
    logger.info(`Création dans backend: ${data.name}`, { id: data.id });
    
    try {
      const response = await fetch(`${this.backendUrl}/api/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      logger.success(`Création réussie dans backend: ${data.name}`, { id: data.id });
      return {
        success: true,
        message: `✅ ${data.name} créé dans le backend`,
        data: await response.json()
      };
    } catch (error) {
      logger.error(`Erreur création backend: ${data.name}`, { error: error.message });
      return {
        success: false,
        message: `❌ Erreur: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Récupérer les données du backend
   */
  async fetchBackendTeam() {
    try {
      const response = await fetch(`${this.backendUrl}/api/team`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      logger.error('Impossible de récupérer équipe du backend', { error: error.message });
      return [];
    }
  }

  /**
   * Générer un rapport de synchronisation
   */
  generateReport(differences) {
    const report = {
      timestamp: new Date().toISOString(),
      totalDifferences: differences.length,
      byType: {
        MISSING_IN_BACKEND: differences.filter(d => d.type === 'MISSING_IN_BACKEND').length,
        MISSING_IN_FRONTEND: differences.filter(d => d.type === 'MISSING_IN_FRONTEND').length,
        MISMATCH: differences.filter(d => d.type === 'MISMATCH').length
      },
      bySeverity: {
        HIGH: differences.filter(d => d.severity === 'HIGH').length,
        MEDIUM: differences.filter(d => d.severity === 'MEDIUM').length,
        LOW: differences.filter(d => d.severity === 'LOW').length
      },
      differences
    };

    return report;
  }

  /**
   * Appliquer une résolution
   */
  async applyResolution(difference, resolution) {
    try {
      if (resolution === 'USE_FRONTEND') {
        // Envoyer la version frontend au backend
        return await this.syncToBackend(difference.frontendData);
      } else if (resolution === 'USE_BACKEND') {
        // Garder la version backend (rien à faire)
        return {
          success: true,
          message: `✅ Garde la version backend`
        };
      } else if (resolution === 'CREATE_IN_BACKEND') {
        // Créer l'élément dans le backend
        return await this.createInBackend(difference.frontendData);
      } else if (resolution === 'DELETE_IN_FRONTEND') {
        // Marquer pour suppression (juste loguer)
        logger.warn(`Élément marqué pour suppression frontend: ${difference.name}`);
        return {
          success: true,
          message: `⚠️ Marqué pour suppression du frontend`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Erreur: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * Synchroniser plusieurs éléments en batch
   */
  async syncBatch(resolutions) {
    if (this.syncInProgress) {
      return { success: false, message: 'Synchronisation déjà en cours' };
    }

    this.syncInProgress = true;
    const results = [];

    try {
      for (const { difference, resolution } of resolutions) {
        const result = await this.applyResolution(difference, resolution);
        results.push({
          id: difference.id,
          name: difference.name,
          ...result
        });
        // Petit délai entre les requêtes
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      logger.success('Synchronisation batch complète', {
        totalItems: resolutions.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      });

      return {
        success: true,
        message: `✅ ${results.filter(r => r.success).length}/${results.length} éléments synchronisés`,
        results
      };
    } catch (error) {
      logger.error('Erreur synchronisation batch', { error: error.message });
      return {
        success: false,
        message: `❌ Erreur: ${error.message}`,
        results
      };
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Auto-résolution intelligente (si possible)
   */
  suggestAutoResolution(difference) {
    switch (difference.type) {
      case 'MISSING_IN_BACKEND':
        // L'élément existe en frontend mais pas en backend → créer en backend
        return 'CREATE_IN_BACKEND';
      
      case 'MISSING_IN_FRONTEND':
        // L'élément existe en backend mais pas en frontend → ignorer (frontend récupère du backend)
        return null;
      
      case 'MISMATCH':
        // Comparer les timestamps ou utiliser backend comme source de vérité
        return 'USE_BACKEND';
      
      default:
        return null;
    }
  }
}

export const syncService = new SyncService();
export default SyncService;
