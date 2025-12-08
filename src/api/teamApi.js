/**
 * API Helper pour la gestion de l'équipe
 * Synchronise les données entre le backoffice et le site TRU
 */

import { getTeamApiUrl, fetchWithTimeout } from '@/config/apiConfig';

// Configuration des URLs
const BACKOFFICE_API = getTeamApiUrl('backoffice');
const ADMIN_FRONTEND_API = getTeamApiUrl('admin');

/**
 * Récupère la liste des membres de l'équipe
 * @returns {Promise<Array>} Liste des membres
 */
export const getTeamMembers = async () => {
  try {
    console.log('🔄 Fetching team members from:', BACKOFFICE_API);
    const response = await fetchWithTimeout(`${BACKOFFICE_API}/team`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-From': 'frontend'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Team members fetched:', data?.length || 0, 'members');
    return data || [];
  } catch (error) {
    console.error('❌ Error fetching team members:', error);
    return [];
  }
};

/**
 * Écoute les mises à jour de l'équipe en temps réel
 * @param {Function} callback Fonction à appeler quand les données changent
 * @returns {Function} Fonction pour arrêter l'écoute
 */
export const listenToTeamUpdates = (callback) => {
  console.log('👂 Setting up team updates listener...');

  // Créer un endpoint pour recevoir les mises à jour du backoffice
  const handleTeamUpdate = async (event) => {
    try {
      const payload = await event.json();
      console.log('📡 Team update received:', payload.action, '-', payload.member?.name);
      callback(payload);
    } catch (error) {
      console.error('❌ Error processing team update:', error);
    }
  };

  // Utiliser EventSource pour les mises à jour en temps réel (si disponible)
  // Sinon, faire un polling
  const pollInterval = setInterval(async () => {
    try {
      const members = await getTeamMembers();
      callback({
        action: 'sync',
        members,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.warn('⚠️ Polling error:', error.message);
    }
  }, 30000); // Polling toutes les 30 secondes

  // Retourner la fonction pour arrêter l'écoute
  return () => {
    clearInterval(pollInterval);
    console.log('🛑 Team updates listener stopped');
  };
};

/**
 * Notify the backoffice when displaying a team member
 * @param {Object} member Le membre affiché
 */
export const notifyMemberViewed = async (member) => {
  try {
    await fetch(`${BACKOFFICE_API}/team-viewed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        member_id: member.id,
        viewed_at: new Date().toISOString(),
        source: 'frontend'
      })
    });
  } catch (error) {
    console.warn('⚠️ Could not notify member view:', error.message);
  }
};

/**
 * Récupère un membre spécifique par son ID
 * @param {string} id ID du membre
 * @returns {Promise<Object>} Données du membre
 */
export const getTeamMember = async (id) => {
  try {
    const response = await fetch(`${BACKOFFICE_API}/team/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const member = await response.json();
    console.log('✅ Team member fetched:', member?.name);
    return member;
  } catch (error) {
    console.error('❌ Error fetching team member:', error);
    return null;
  }
};

/**
 * Récupère les membres visibles uniquement
 * @returns {Promise<Array>} Liste des membres visibles
 */
export const getVisibleTeamMembers = async () => {
  try {
    const members = await getTeamMembers();
    return members.filter(m => m.is_visible !== false);
  } catch (error) {
    console.error('❌ Error filtering visible members:', error);
    return [];
  }
};

/**
 * Récupère les fondateurs de l'équipe
 * @returns {Promise<Array>} Liste des fondateurs
 */
export const getFounders = async () => {
  try {
    const members = await getTeamMembers();
    return members.filter(m => m.is_founder === true && m.is_visible !== false);
  } catch (error) {
    console.error('❌ Error fetching founders:', error);
    return [];
  }
};

/**
 * Récupère les statistiques de l'équipe
 * @returns {Promise<Object>} Statistiques
 */
export const getTeamStats = async () => {
  try {
    const members = await getTeamMembers();
    const visibleMembers = members.filter(m => m.is_visible !== false);
    const founders = members.filter(m => m.is_founder === true);

    return {
      total: members.length,
      visible: visibleMembers.length,
      founders: founders.length,
      expertise_tags: new Set(members.flatMap(m => m.expertise || [])).size,
      achievements_tags: new Set(members.flatMap(m => m.achievements || [])).size
    };
  } catch (error) {
    console.error('❌ Error calculating team stats:', error);
    return {
      total: 0,
      visible: 0,
      founders: 0,
      expertise_tags: 0,
      achievements_tags: 0
    };
  }
};

export default {
  getTeamMembers,
  listenToTeamUpdates,
  notifyMemberViewed,
  getTeamMember,
  getVisibleTeamMembers,
  getFounders,
  getTeamStats
};
