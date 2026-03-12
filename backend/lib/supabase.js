/**
 * Supabase Database Helper
 * 
 * Features:
 * - PostgreSQL queries
 * - Realtime subscriptions
 * - Auto-generated REST API
 * - Row Level Security
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Vérifier les variables d'environnement
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please add SUPABASE_URL and SUPABASE_KEY to .env');
  process.exit(1);
}

// Créer le client Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
  {
    auth: {
      persistSession: false, // Server-side, pas de session persistée
    },
    db: {
      schema: 'public',
    },
  }
);

// Expose storage client for uploads
export const storage = supabase.storage;

/**
 * Execute raw SQL query (pour migrations)
 * @param {string} sql SQL query
 * @returns {Promise}
 */
export const query = async (sql, params = []) => {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { 
      query: sql, 
      params 
    });
    
    if (error) throw error;
    
    return { rows: data };
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
};

/**
 * Services Table Operations
 */
export const services = {
  // GET all
  async getAll() {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('ordering', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // GET by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // CREATE
  async create(serviceData) {
    const { data, error } = await supabase
      .from('services')
      .insert([serviceData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // UPDATE
  async update(id, serviceData) {
    const { data, error } = await supabase
      .from('services')
      .update({ ...serviceData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // DELETE
  async delete(id) {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Solutions Table Operations
 */
export const solutions = {
  async getAll() {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .order('ordering', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('solutions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(solutionData) {
    const { data, error } = await supabase
      .from('solutions')
      .insert([solutionData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, solutionData) {
    const { data, error } = await supabase
      .from('solutions')
      .update({ ...solutionData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('solutions')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Team Table Operations
 */
export const team = {
  async getAll() {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .order('ordering', { ascending: true })
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('team')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(memberData) {
    const { data, error } = await supabase
      .from('team')
      .insert([memberData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, memberData) {
    const { data, error } = await supabase
      .from('team')
      .update({ ...memberData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('team')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Contacts Table Operations
 */
export const contacts = {
  async getAll() {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(contactData) {
    const { data, error } = await supabase
      .from('contacts')
      .insert([contactData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateStatus(id, status, notes = null) {
    const updates = { status, updated_at: new Date().toISOString() };
    if (notes) updates.notes = notes;
    
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, updateData) {
    const { data, error } = await supabase
      .from('contacts')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Settings Table Operations
 */
export const settings = {
  async get(key) {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data?.value;
  },

  async set(key, value) {
    const { data, error } = await supabase
      .from('settings')
      .upsert([{ key, value }], { onConflict: 'key' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getAll() {
    const { data, error } = await supabase
      .from('settings')
      .select('*');
    
    if (error) throw error;
    return data;
  },

  async create(settingsData) {
    const { data, error } = await supabase
      .from('settings')
      .insert([settingsData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, settingsData) {
    const { data, error } = await supabase
      .from('settings')
      .update(settingsData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};

/**
 * Jobs Table Operations
 */
export const jobs = {
  async getAll() {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .insert([{
        title: jobData.title,
        description: jobData.description,
        location: jobData.location || null,
        type: jobData.type || null,
        department: jobData.department || null,
        requirements: jobData.requirements || null,
        salary_range: jobData.salaryRange || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, jobData) {
    const { data, error } = await supabase
      .from('jobs')
      .update({
        title: jobData.title,
        description: jobData.description,
        location: jobData.location || null,
        type: jobData.type || null,
        department: jobData.department || null,
        requirements: jobData.requirements || null,
        salary_range: jobData.salaryRange || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Candidature (Applications) Operations
 */
export const candidature = {
  async getAll() {
    const { data, error } = await supabase
      .from('candidature')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('candidature')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByJobId(jobId) {
    const { data, error } = await supabase
      .from('candidature')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(candidatureData) {
    const { data, error } = await supabase
      .from('candidature')
      .insert([candidatureData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, candidatureData) {
    const { data, error } = await supabase
      .from('candidature')
      .update(candidatureData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('candidature')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Actualite (News/Blog) Operations
 */
export const actualite = {
  async getAll() {
    const { data, error } = await supabase
      .from('actualite')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getAllIncludingDrafts() {
    const { data, error } = await supabase
      .from('actualite')
      .select('*')
      .order('published_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('actualite')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('actualite')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(actualiteData) {
    const { data, error } = await supabase
      .from('actualite')
      .insert([actualiteData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, actualiteData) {
    const { data, error } = await supabase
      .from('actualite')
      .update(actualiteData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('actualite')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Temoignages (Testimonials) Operations
 */
export const temoignages = {
  async getAll() {
    const { data, error } = await supabase
      .from('temoignages')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getAllIncludingDrafts() {
    const { data, error } = await supabase
      .from('temoignages')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('temoignages')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(temoignageData) {
    const { data, error } = await supabase
      .from('temoignages')
      .insert([temoignageData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, temoignageData) {
    const { data, error } = await supabase
      .from('temoignages')
      .update(temoignageData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('temoignages')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Projets Realises (Completed Projects) Operations
 */
export const projetsRealises = {
  async getAll() {
    const { data, error } = await supabase
      .from('projets_realises')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getAllIncludingDrafts() {
    const { data, error } = await supabase
      .from('projets_realises')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('projets_realises')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getBySlug(slug) {
    const { data, error } = await supabase
      .from('projets_realises')
      .select('*')
      .eq('slug', slug)
      .single();
    
    if (error) throw error;
    return data;
  },

  async getByCategory(category) {
    const { data, error } = await supabase
      .from('projets_realises')
      .select('*')
      .eq('category', category)
      .eq('published', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async create(projetData) {
    const { data, error } = await supabase
      .from('projets_realises')
      .insert([projetData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id, projetData) {
    const { data, error } = await supabase
      .from('projets_realises')
      .update(projetData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('projets_realises')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Realtime Subscriptions
 */
export const subscribeToTable = (tableName, callback) => {
  const subscription = supabase
    .channel(`public:${tableName}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: tableName },
      callback
    )
    .subscribe();

  return subscription;
};

/**
 * Health Check
 */
export const healthCheck = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      connected: true
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString(),
      connected: false
    };
  }
};

/**
 * Formations Table Operations
 */
export const formations = {
  // GET all formations actives
  async getAll() {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .order('date_debut', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  // GET by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('formations')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // CREATE
  async create(formationData) {
    const { data, error } = await supabase
      .from('formations')
      .insert([formationData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // UPDATE
  async update(id, formationData) {
    const { data, error } = await supabase
      .from('formations')
      .update({ ...formationData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // DELETE
  async delete(id) {
    const { error } = await supabase
      .from('formations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Inscriptions Formations Table Operations
 */
export const inscriptionsFormations = {
  // GET all inscriptions
  async getAll() {
    const { data, error } = await supabase
      .from('inscriptions_formations')
      .select('*, formations(*)')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // GET by ID
  async getById(id) {
    const { data, error } = await supabase
      .from('inscriptions_formations')
      .select('*, formations(*)')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  // GET by numero_inscription
  async getByNumero(numero) {
    const { data, error } = await supabase
      .from('inscriptions_formations')
      .select('*, formations(*)')
      .eq('numero_inscription', numero)
      .single();
    
    if (error) throw error;
    return data;
  },

  // CREATE (numéro auto-généré par trigger SQL)
  async create(inscriptionData) {
    const { data, error } = await supabase
      .from('inscriptions_formations')
      .insert([inscriptionData])
      .select('*, formations(*)')
      .single();
    
    if (error) throw error;
    return data;
  },

  // UPDATE
  async update(id, inscriptionData) {
    const { data, error } = await supabase
      .from('inscriptions_formations')
      .update({ ...inscriptionData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, formations(*)')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Confirmer paiement
  async confirmerPaiement(numeroInscription, montant) {
    const { data, error } = await supabase
      .from('inscriptions_formations')
      .update({
        statut: 'confirmee',
        paiement_confirme_le: new Date().toISOString(),
        montant_paye: montant,
        updated_at: new Date().toISOString()
      })
      .eq('numero_inscription', numeroInscription)
      .select('*, formations(*)')
      .single();
    
    if (error) throw error;
    return data;
  },

  // Marquer fiche téléchargée
  async marquerTelecharge(id) {
    const { data, error } = await supabase
      .from('inscriptions_formations')
      .update({
        fiche_telechargee_le: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // DELETE
  async delete(id) {
    const { error } = await supabase
      .from('inscriptions_formations')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { success: true };
  }
};

/**
 * Backup to JSON (pour fallback)
 */
export const backupToJSON = async () => {
  try {
    const [servicesData, teamData, solutionsData, contactsData] = await Promise.all([
      services.getAll(),
      team.getAll(),
      solutions.getAll(),
      contacts.getAll()
    ]);

    return {
      services: servicesData,
      team: teamData,
      solutions: solutionsData,
      contacts: contactsData,
      backedUpAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Backup failed:', error);
    throw error;
  }
};

export { supabase };
export default supabase;
