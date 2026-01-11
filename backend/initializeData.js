/**
 * Initialize data.json with fallback to GitHub
 * Si data.json n'existe pas dans le volume persistant Render,
 * on télécharge la dernière version depuis GitHub
 * 
 * PRIORITÉ DE CHARGEMENT:
 * 1. data.json dans le volume persistant (TOUJOURS préféré s'il existe)
 * 2. Télécharger depuis GitHub si data.json manquant
 * 3. Fallback data.example.json (seulement si GitHub indisponible)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utiliser le volume persistant si disponible
const DATA_DIR = process.env.DATA_DIR || __dirname;
const DATA_FILE = path.join(DATA_DIR, 'data.json');
const DATA_EXAMPLE_FILE = path.join(__dirname, 'data.example.json');

// IMPORTANT: Vérifier si on utilise un volume persistant
const USING_PERSISTENT_VOLUME = process.env.DATA_DIR && process.env.DATA_DIR !== __dirname;

console.log(`\n📦 INITIALIZATION CONFIG:`);
console.log(`   DATA_DIR: ${DATA_DIR}`);
console.log(`   DATA_FILE: ${DATA_FILE}`);
console.log(`   Using persistent volume: ${USING_PERSISTENT_VOLUME ? 'YES ✅' : 'NO'}`);

// Assurer que le répertoire existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  console.log(`📂 Répertoire créé: ${DATA_DIR}`);
}

/**
 * Télécharger data.json depuis GitHub
 */
async function downloadFromGithub() {
  try {
    console.log('⬇️  Téléchargement de data.json depuis GitHub...');
    
    const repo = 'efoka24-ops/tru-backend';
    const branch = 'main';
    const filePath = 'data.json';
    
    const url = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`❌ Erreur GitHub: ${response.status} ${response.statusText}`);
      return null;
    }
    
    const data = await response.json();
    console.log('✅ Données téléchargées depuis GitHub avec succès');
    return data;
    
  } catch (error) {
    console.error('❌ Erreur téléchargement GitHub:', error.message);
    return null;
  }
}

/**
 * Initialiser data.json avec protection stricte contre la perte de données
 */
export async function initializeData() {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`⚙️  DATA INITIALIZATION`);
  console.log(`${'='.repeat(60)}`);
  
  // ÉTAPE 1: Vérifier si data.json existe DANS LE VOLUME
  if (fs.existsSync(DATA_FILE)) {
    try {
      const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(fileContent);
      console.log('✅ STATUS: data.json trouvé dans le volume persistant');
      console.log(`   └─ ${data.team?.length || 0} membres d'équipe`);
      console.log(`   └─ ${data.services?.length || 0} services`);
      console.log(`   └─ ${data.solutions?.length || 0} solutions`);
      console.log(`   └─ ${data.contacts?.length || 0} contacts`);
      console.log(`${'='.repeat(60)}\n`);
      return data;
    } catch (error) {
      console.error('❌ ERREUR: Lecture data.json corrompue:', error.message);
      // Ne pas basculer sur GitHub si le fichier existe mais est corrompu
      // Au lieu de cela, retourner un objet vide pour éviter la perte de données
      console.warn('⚠️  ATTENTION: Retour objet vide au lieu de réinitialiser');
      return {
        users: [],
        services: [],
        contacts: [],
        team: [],
        solutions: [],
        settings: {},
        testimonials: [],
        jobs: [],
        news: [],
        applications: [],
        projects: []
      };
    }
  }
  
  // ÉTAPE 2: Si ON UTILISE UN VOLUME PERSISTANT mais data.json n'existe pas
  // → Cela signifie que c'est le premier démarrage du volume
  console.log('⚠️  STATUS: data.json introuvable dans le volume...');
  console.log('   Tentative de téléchargement depuis GitHub...\n');
  
  const githubData = await downloadFromGithub();
  
  if (githubData) {
    console.log('✅ Données GitHub téléchargées avec succès');
    console.log(`   └─ ${githubData.team?.length || 0} membres`);
    console.log(`   └─ ${githubData.services?.length || 0} services`);
    
    // Sauvegarder dans le volume pour les prochains redémarrages
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(githubData, null, 2));
      console.log('💾 Données sauvegardées dans le volume persistant');
      console.log(`${'='.repeat(60)}\n`);
      return githubData;
    } catch (error) {
      console.error('❌ ERREUR: Sauvegarde volume échouée:', error.message);
      return githubData; // Retourner les données même si la sauvegarde échoue
    }
  }
  
  // ÉTAPE 3: Fallback sur data.example.json (DERNIER RECOURS)
  console.log('❌ ERREUR: GitHub indisponible ou introuvable');
  console.log('⚠️  FALLBACK: Utilisation de data.example.json');
  console.log('   ⚠️  ATTENTION: Les données seront réinitialisées!\n');
  
  try {
    const exampleData = fs.readFileSync(DATA_EXAMPLE_FILE, 'utf-8');
    const data = JSON.parse(exampleData);
    
    // Sauvegarder pour les prochains redémarrages
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('✅ data.json créé à partir de data.example.json');
    } catch (writeError) {
      console.error('⚠️  Impossible de sauvegarder dans volume:', writeError.message);
    }
    
    console.log(`${'='.repeat(60)}\n`);
    return data;
    
  } catch (error) {
    console.error('❌ ERREUR CRITIQUE: Impossible de charger data.example.json:', error.message);
    console.log('⚠️  Retour de structure vide par défaut\n');
    return {
      users: [],
      services: [],
      contacts: [],
      team: [],
      solutions: [],
      settings: {},
      testimonials: [],
      jobs: [],
      news: [],
      applications: [],
      projects: []
    };
  }
}

export default initializeData;
