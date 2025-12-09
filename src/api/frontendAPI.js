/**
 * Frontend API Setup
 * Configure les endpoints API locaux pour le frontend
 */

export function setupFrontendAPI() {
  // Endpoints pour la synchronisation d'équipe
  const setupTeamEndpoints = () => {
    // GET /api/team - Récupère l'équipe
    if (!window.__teamEndpoints) {
      window.__teamEndpoints = {
        listeners: [],
        data: []
      };
    }

    // Enregistrer les listeners pour la synchronisation
    const registerTeamListener = (callback) => {
      if (window.__teamEndpoints) {
        window.__teamEndpoints.listeners.push(callback);
      }
    };

    // Notifier les listeners d'un changement
    const notifyTeamChange = (action, member) => {
      if (window.__teamEndpoints) {
        window.__teamEndpoints.listeners.forEach(listener => {
          try {
            listener({ action, member, timestamp: new Date().toISOString() });
          } catch (error) {
            console.error('Error in team listener:', error);
          }
        });
      }
    };

    window.__teamAPI = {
      registerListener: registerTeamListener,
      notifyChange: notifyTeamChange
    };

    console.log('✅ Team API endpoints initialized');
  };

  // Initialiser les endpoints d'équipe
  setupTeamEndpoints();

  // Log confirmation
  console.log('✅ Frontend API setup completed');
  return true;
}

/**
 * Hook pour utiliser l'API du frontend
 */
export function useTeamAPI() {
  const registerListener = (callback) => {
    if (window.__teamAPI) {
      window.__teamAPI.registerListener(callback);
    }
  };

  const notifyChange = (action, member) => {
    if (window.__teamAPI) {
      window.__teamAPI.notifyChange(action, member);
    }
  };

  return {
    registerListener,
    notifyChange
  };
}
