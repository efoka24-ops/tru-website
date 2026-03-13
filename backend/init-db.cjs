/**
 * Database Initialization Script (.cjs format for Node.js ES modules)
 * 
 * This script initializes the backend database with default content
 * while preserving any existing data that has been modified via the backoffice.
 * It also creates a backup of existing data before initialization.
 * 
 * Usage: node init-db.cjs
 */

const fs = require('fs');
const path = require('path');

/**
 * Create a backup of current data.json
 */
function createBackup() {
  const dataPath = path.join(__dirname, 'data.json');
  const backupDir = path.join(__dirname, 'backups');
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
    console.log('✅ Dossier backups créé');
  }
  
  // Check if data.json exists
  if (fs.existsSync(dataPath)) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupPath = path.join(backupDir, `data.backup-${timestamp}.json`);
    
    try {
      const data = fs.readFileSync(dataPath, 'utf8');
      fs.writeFileSync(backupPath, data);
      console.log(`✅ Backup créé: ${backupPath}`);
    } catch (err) {
      console.error('❌ Erreur lors de la création du backup:', err.message);
    }
  }
}

// Path to data.json
const dataPath = path.join(__dirname, 'data.json');

// Create backup before initialization
createBackup();

// Default data structure
const defaultData = {
  users: [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@trugroup.cm',
      password: 'TRU2024!',
      role: 'admin',
      createdAt: '2025-01-01T00:00:00Z'
    }
  ],
  services: [
    {
      id: 1,
      icon: 'Building2',
      title: 'Conseil & Organisation',
      description: 'Nous accompagnons les institutions dans leur modernisation organisationnelle.',
      features: [
        'Audit organisationnel',
        'Cartographie et optimisation des processus',
        'Rédaction de manuels et procédures',
        'Conduite du changement'
      ],
      objective: 'Rendre les organisations plus efficientes, modernes et transparentes.',
      color: 'from-blue-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      display_order: 1
    },
    {
      id: 2,
      icon: 'Monitor',
      title: 'Transformation digitale',
      description: 'Nous concevons et déployons des solutions numériques adaptées à vos besoins.',
      features: [
        'Digitalisation des services publics',
        'E-administration',
        'Outils de gestion',
        'Tableaux de bord décisionnels'
      ],
      objective: 'Rendre la technologie accessible et durable.',
      color: 'from-amber-500 to-orange-600',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
      display_order: 2
    },
    {
      id: 3,
      icon: 'Smartphone',
      title: 'Développement d\'applications',
      description: 'Nous créons des plateformes et applications sur mesure.',
      features: [
        'Applications mobiles',
        'Plateformes web',
        'Systèmes d\'information sectoriels',
        'Outils SaaS'
      ],
      objective: 'Concevoir des solutions sur mesure, scalables et sécurisées.',
      color: 'from-emerald-500 to-teal-600',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
      display_order: 3
    },
    {
      id: 4,
      icon: 'ClipboardCheck',
      title: 'Gestion de projet & assistance technique',
      description: 'Nous mettons à disposition des experts pour garantir le succès de vos projets.',
      features: [
        'Gestion de projet',
        'Pilotage stratégique',
        'Suivi-évaluation',
        'Coordination multisectorielle'
      ],
      objective: 'Garantir la réussite de chaque projet.',
      color: 'from-purple-500 to-violet-600',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      display_order: 4
    },
    {
      id: 5,
      icon: 'GraduationCap',
      title: 'Formation & renforcement des capacités',
      description: 'Nous proposons des formations professionnelles adaptées.',
      features: [
        'Gestion de projet (classique & agile)',
        'Outils numériques',
        'Data & intelligence décisionnelle',
        'Leadership et innovation'
      ],
      objective: 'Renforcer l\'employabilité des jeunes et cadres locaux.',
      color: 'from-pink-500 to-rose-600',
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800&h=600&fit=crop',
      display_order: 5
    }
  ],
  team: [
    {
      id: 1,
      name: 'Emmanuel Foka',
      role: 'Fondateur & Directeur Général',
      bio: 'Emmanuel est le fondateur et directeur général de TRU GROUP. Avec plus de 10 ans d\'expérience en transformation digitale et conseil, il pilote la vision stratégique de l\'entreprise.',
      photo_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/images/team/emmanuel.jpg',
      expertise: ['Stratégie digitale', 'Gestion de projets', 'Innovation'],
      achievements: ['10+ ans d\'expérience', 'Expert en transformation'],
      display_order: 1
    },
    {
      id: 2,
      name: 'Tatinou Hervé',
      role: 'Senior UI/UX Designer',
      bio: 'Tatinou est notre Senior Designer avec 8 ans d\'expérience. Il crée des interfaces innovantes et user-centric.',
      photo_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/images/team/tatinou.jpg',
      expertise: ['UI/UX Design', 'Product Design', 'User Research'],
      achievements: ['8+ ans d\'expérience', 'Award-winning designs'],
      display_order: 2
    },
    {
      id: 3,
      name: 'Halimatou Sadia Ahmadou',
      role: 'Lead Project Manager',
      bio: 'Halimatou gère nos projets d\'envergure avec rigueur et excellence. Experte en gestion agile et waterfall.',
      photo_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/images/team/halimatou.jpg',
      expertise: ['Gestion de projets', 'Agile/Scrum', 'Coordination'],
      achievements: ['Certifiée PMP', '15+ projets réussis'],
      display_order: 3
    }
  ],
  testimonials: [
    {
      id: 1,
      name: 'Minister Jean Paul Mbianda',
      role: 'Ministre des Postes et Télécommunications',
      company: 'République du Cameroun',
      content: 'TRU GROUP a transformé notre approche de la digitalisation. Leur expertise et dévouement sont exemplaires.',
      photo_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/images/testimonials/minister.jpg',
      rating: 5,
      display_order: 1
    },
    {
      id: 2,
      name: 'Dr. Félicité Njatcha',
      role: 'Directrice',
      company: 'Health Ministry',
      content: 'Une équipe professionnelle et efficace. Nos projets de santé digitale ont dépassé nos attentes.',
      photo_url: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/images/testimonials/doctor.jpg',
      rating: 5,
      display_order: 2
    }
  ],
  solutions: [
    {
      id: 1,
      title: 'Plateforme E-Services',
      description: 'Solution intégrée pour les services publics en ligne.',
      icon: 'Globe',
      color: 'from-blue-500 to-blue-600',
      display_order: 1
    },
    {
      id: 2,
      title: 'System ERP',
      description: 'Gestion intégrée de vos ressources entreprise.',
      icon: 'BarChart3',
      color: 'from-green-500 to-green-600',
      display_order: 2
    },
    {
      id: 3,
      title: 'Mobile App Suite',
      description: 'Applications mobiles professionnelles et scalables.',
      icon: 'Smartphone',
      color: 'from-purple-500 to-purple-600',
      display_order: 3
    }
  ],
  settings: [
    {
      id: 1,
      company_name: 'TRU GROUP',
      slogan: 'Au cœur de l\'innovation',
      phone: '+237 691 22 71 49',
      email: 'info@trugroup.cm',
      address: 'Maroua, Cameroun',
      primary_color: '#22c55e',
      secondary_color: '#16a34a',
      logo_url: '/assets/trugroup-logo.jfif',
      facebook_url: '#',
      linkedin_url: '#',
      twitter_url: '#',
      maintenanceMode: false
    }
  ],
  contacts: [],
  news: [],
  jobs: [],
  applications: []
};

/**
 * Intelligently merge existing data with defaults
 * Preserves modifications made via backoffice
 */
function mergeData(existing, defaults) {
  const merged = { ...defaults };

  // For each collection
  for (const collection in defaults) {
    if (Array.isArray(defaults[collection])) {
      if (!existing[collection] || !Array.isArray(existing[collection])) {
        existing[collection] = [];
      }

      // Create a map of existing items by ID
      const existingMap = new Map(
        existing[collection].map(item => [item.id, item])
      );

      // Keep existing items and add missing default items
      const result = [];
      
      // First, add all existing items
      existing[collection].forEach(item => {
        result.push(item);
      });

      // Then, add default items that don't exist
      defaults[collection].forEach(defaultItem => {
        if (!existingMap.has(defaultItem.id)) {
          result.push(defaultItem);
        }
      });

      merged[collection] = result;
    } else if (typeof defaults[collection] === 'object' && defaults[collection] !== null) {
      // For object collections, merge properties
      if (Array.isArray(defaults[collection])) {
        merged[collection] = defaults[collection];
      } else {
        merged[collection] = {
          ...defaults[collection],
          ...(existing[collection] || {})
        };
      }
    }
  }

  return merged;
}

/**
 * Initialize database
 */
function initializeDatabase() {
  try {
    let existingData = {};

    // Check if data.json exists and has content
    if (fs.existsSync(dataPath)) {
      const content = fs.readFileSync(dataPath, 'utf-8');
      if (content.trim()) {
        existingData = JSON.parse(content);
        console.log('✅ Existing data.json found');
      }
    }

    // Merge existing data with defaults
    const mergedData = mergeData(existingData, defaultData);

    // Write merged data back to file
    fs.writeFileSync(dataPath, JSON.stringify(mergedData, null, 2));

    console.log('✅ Database initialized successfully!');
    console.log('📊 Statistics:');
    console.log(`  - Users: ${mergedData.users.length}`);
    console.log(`  - Services: ${mergedData.services.length}`);
    console.log(`  - Team: ${mergedData.team.length}`);
    console.log(`  - Testimonials: ${mergedData.testimonials.length}`);
    console.log(`  - Solutions: ${mergedData.solutions.length}`);
    console.log(`  - Contacts: ${mergedData.contacts.length}`);
    console.log(`  - Settings: ${mergedData.settings.length}`);

  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
