/**
 * Mock Backend Server
 * 
 * Serves all API endpoints for frontend testing
 * without requiring external services (Supabase, etc.)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

function parseSqlString(value) {
  if (value === 'NULL') {
    return null;
  }

  if (value.startsWith("'") && value.endsWith("'")) {
    return value.slice(1, -1).replace(/''/g, "'");
  }

  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
}

function splitSqlTuple(tupleContent) {
  const values = [];
  let current = '';
  let inQuote = false;

  for (let index = 0; index < tupleContent.length; index += 1) {
    const char = tupleContent[index];
    const next = tupleContent[index + 1];

    if (char === "'") {
      current += char;
      if (inQuote && next === "'") {
        current += next;
        index += 1;
      } else {
        inQuote = !inQuote;
      }
      continue;
    }

    if (char === ',' && !inQuote) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  return values;
}

function extractSqlTuples(valuesBlock) {
  const tuples = [];
  let current = '';
  let depth = 0;
  let inQuote = false;

  for (let index = 0; index < valuesBlock.length; index += 1) {
    const char = valuesBlock[index];
    const next = valuesBlock[index + 1];

    if (char === "'") {
      current += char;
      if (inQuote && next === "'") {
        current += next;
        index += 1;
      } else {
        inQuote = !inQuote;
      }
      continue;
    }

    if (!inQuote && char === '(') {
      if (depth > 0) {
        current += char;
      }
      depth += 1;
      continue;
    }

    if (!inQuote && char === ')') {
      depth -= 1;
      if (depth === 0) {
        tuples.push(current);
        current = '';
      } else {
        current += char;
      }
      continue;
    }

    if (depth > 0) {
      current += char;
    }
  }

  return tuples;
}

function parseFormationsInsert(statement, categorie, startId) {
  const columnsMatch = statement.match(/INSERT INTO formations \(([^)]+)\) VALUES/i);
  if (!columnsMatch) {
    return [];
  }

  const columns = columnsMatch[1].split(',').map((column) => column.trim());
  const valuesIndex = statement.indexOf('VALUES');
  const valuesBlock = statement.slice(valuesIndex + 'VALUES'.length).trim().replace(/;\s*$/, '');
  const tuples = extractSqlTuples(valuesBlock);

  return tuples.map((tuple, offset) => {
    const values = splitSqlTuple(tuple);
    const formation = { id: startId + offset, categorie };

    columns.forEach((column, index) => {
      const parsedValue = parseSqlString(values[index]);

      if (column === 'modules' && typeof parsedValue === 'string') {
        try {
          formation[column] = JSON.parse(parsedValue);
        } catch {
          formation[column] = [parsedValue];
        }
        return;
      }

      formation[column] = parsedValue;
    });

    return formation;
  });
}

function loadCatalogueFormations() {
  const fallbackFormations = [
    {
      id: 1,
      titre: 'Formation 1',
      description: 'First training',
      statut: 'active',
      prix: 99.99,
      format: 'hybride',
      date_debut: '2025-04-01',
      categorie: 'Catalogue indisponible'
    }
  ];

  try {
    const cataloguePath = path.resolve(__dirname, '../backend/formations-catalogue.sql');
    const sqlContent = fs.readFileSync(cataloguePath, 'utf8');
    const lines = sqlContent.split(/\r?\n/);

    let currentCategory = 'Catalogue TRU Group';
    let currentStatement = '';
    let collectingInsert = false;
    let nextId = 1;
    const formations = [];

    for (const line of lines) {
      const categoryMatch = line.match(/^--\s*CAT[ÉE]GORIE\s+\d+\s*:\s*(.+?)\s*\(/i);
      if (categoryMatch) {
        currentCategory = categoryMatch[1].trim();
      }

      if (!collectingInsert && /INSERT INTO formations/i.test(line)) {
        collectingInsert = true;
        currentStatement = `${line}\n`;
        continue;
      }

      if (collectingInsert) {
        currentStatement += `${line}\n`;
        if (line.includes(';')) {
          const parsedFormations = parseFormationsInsert(currentStatement, currentCategory, nextId);
          formations.push(...parsedFormations);
          nextId += parsedFormations.length;
          collectingInsert = false;
          currentStatement = '';
        }
      }
    }

    return formations.length > 0 ? formations : fallbackFormations;
  } catch (error) {
    console.warn('Failed to load SQL catalogue for mock backend:', error.message);
    return fallbackFormations;
  }
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== MOCK DATA ======
const mockData = {
  team: [],
  services: [
    {
      id: 1,
      title: 'Conseil en organisation et performance',
      name: 'Conseil en organisation et performance',
      category: 'Conseil',
      description: 'Nous analysons vos processus, clarifions les rôles et mettons en place une gouvernance efficace pour améliorer durablement la performance.',
      objective: 'Optimiser les opérations et renforcer la qualité de service.',
      features: ['Audit organisationnel', 'Optimisation des processus', 'Gouvernance et pilotage', 'Conduite du changement'],
      icon: 'Building2',
      color: 'from-blue-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      status: 'active',
      order_index: 1
    },
    {
      id: 2,
      title: 'Transformation digitale',
      name: 'Transformation digitale',
      category: 'Digital',
      description: 'Nous concevons et déployons votre feuille de route digitale: dématérialisation, automatisation et modernisation des parcours métier.',
      objective: 'Accélérer la transformation et réduire les frictions internes.',
      features: ['Feuille de route digitale', 'Dématérialisation', 'Automatisation des workflows', 'Modernisation des parcours'],
      icon: 'Monitor',
      color: 'from-amber-500 to-orange-600',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
      status: 'active',
      order_index: 2
    },
    {
      id: 3,
      title: 'Développement d\'applications web et mobile',
      name: 'Développement d\'applications web et mobile',
      category: 'Développement',
      description: 'Nous réalisons des plateformes web et mobiles sur mesure, sécurisées et évolutives, adaptées à vos besoins métier.',
      objective: 'Digitaliser vos services avec des outils fiables et performants.',
      features: ['Applications web', 'Applications mobiles', 'Portails métier', 'Maintenance évolutive'],
      icon: 'Code2',
      color: 'from-emerald-500 to-teal-600',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=600&fit=crop',
      status: 'active',
      order_index: 3
    },
    {
      id: 4,
      title: 'Data, BI et tableaux de bord',
      name: 'Data, BI et tableaux de bord',
      category: 'Data',
      description: 'Nous structurons vos données et mettons en place des tableaux de bord décisionnels pour piloter vos activités en temps réel.',
      objective: 'Décider plus vite et mieux grâce à la donnée.',
      features: ['Collecte et qualité des données', 'Modélisation', 'Dashboards KPI', 'Reporting décisionnel'],
      icon: 'BarChart3',
      color: 'from-cyan-500 to-blue-600',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      status: 'active',
      order_index: 4
    },
    {
      id: 5,
      title: 'Cybersécurité et conformité',
      name: 'Cybersécurité et conformité',
      category: 'Sécurité',
      description: 'Nous renforçons la sécurité de vos systèmes avec audits, politiques, sensibilisation et plan de gestion des risques.',
      objective: 'Protéger vos actifs numériques et garantir la continuité d\'activité.',
      features: ['Audit sécurité', 'Gestion des risques', 'Conformité', 'Sensibilisation des équipes'],
      icon: 'ShieldCheck',
      color: 'from-rose-500 to-red-600',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
      status: 'active',
      order_index: 5
    },
    {
      id: 6,
      title: 'Cloud, DevOps et infrastructure',
      name: 'Cloud, DevOps et infrastructure',
      category: 'Infrastructure',
      description: 'Nous accompagnons vos migrations cloud, l\'industrialisation CI/CD et l\'optimisation de l\'infrastructure.',
      objective: 'Gagner en disponibilité, scalabilité et rapidité de livraison.',
      features: ['Migration cloud', 'CI/CD', 'Supervision', 'Optimisation des coûts'],
      icon: 'CloudCog',
      color: 'from-sky-500 to-indigo-600',
      image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop',
      status: 'active',
      order_index: 6
    },
    {
      id: 7,
      title: 'Formation et renforcement des capacités',
      name: 'Formation et renforcement des capacités',
      category: 'Formation',
      description: 'Nous proposons des formations pratiques et certifiantes pour équipes techniques, métiers et management.',
      objective: 'Monter en compétences de façon mesurable et durable.',
      features: ['Formations certifiantes', 'Ateliers pratiques', 'Coaching d\'équipe', 'Évaluation des acquis'],
      icon: 'GraduationCap',
      color: 'from-fuchsia-500 to-pink-600',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=600&fit=crop',
      status: 'active',
      order_index: 7
    },
    {
      id: 8,
      title: 'Assistance technique et gestion de projet',
      name: 'Assistance technique et gestion de projet',
      category: 'Pilotage',
      description: 'Nous mettons à disposition des experts pour piloter vos projets (PMO, Agile, qualité, coordination).',
      objective: 'Assurer la réussite opérationnelle de vos projets stratégiques.',
      features: ['PMO', 'Pilotage Agile', 'Suivi qualité', 'Coordination multi-acteurs'],
      icon: 'Briefcase',
      color: 'from-violet-500 to-purple-600',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      image_url: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      status: 'active',
      order_index: 8
    }
  ],
  news: [
    { id: 1, title: 'Welcome to TRU', content: 'Welcome to TRU Group!', createdAt: new Date().toISOString() }
  ],
  projects: [
    { id: 1, title: 'Project Alpha', description: 'First major project' }
  ],
  testimonials: [
    { id: 1, name: 'Client A', text: 'Great service!' }
  ],
  solutions: [
    { id: 1, title: 'Solution 1', description: 'First solution' }
  ],
  settings: {
    siteName: 'TRU Group',
    company_name: 'TRU GROUP',
    slogan: 'Au coeur de l\'innovation',
    description: 'Cabinet de conseil et d\'ingenierie digitale.',
    maxImageSize: 5242880,
    theme: 'light'
  },
  formations: loadCatalogueFormations(),
  inscriptions: [
    { id: 1, numero_inscription: 'FRM001', formation_id: 1, email: 'student@example.com', statut: 'actif' }
  ],
  contacts: [
    { id: 1, name: 'Test Contact', email: 'test@example.com', message: 'Test message', createdAt: new Date().toISOString() }
  ],
  logs: []
};

// ====== AUTH HELPERS ======
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-local-change-me';

function generateToken(userId, isAdmin = false) {
  // Simple JWT mock (not cryptographically secure - dev only)
  return Buffer.from(JSON.stringify({ userId, isAdmin, iat: Date.now() })).toString('base64');
}

function verifyToken(token) {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return decoded;
  } catch {
    return null;
  }
}

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.slice(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  req.user = decoded;
  next();
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin required' });
    }
    next();
  });
}

// ====== ROUTES ======

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'mock-backend' });
});

// === TEAM ===
app.get('/api/team', (req, res) => {
  res.json(mockData.team);
});

app.post('/api/team', requireAdmin, (req, res) => {
  const newMember = { id: mockData.team.length + 1, ...req.body };
  mockData.team.push(newMember);
  res.status(201).json(newMember);
});

app.get('/api/team/:id', (req, res) => {
  const member = mockData.team.find(m => m.id === parseInt(req.params.id));
  res.json(member || { error: 'Not found' });
});

app.put('/api/team/:id', requireAdmin, (req, res) => {
  const member = mockData.team.find(m => m.id === parseInt(req.params.id));
  if (!member) return res.status(404).json({ error: 'Not found' });
  Object.assign(member, req.body);
  res.json(member);
});

app.delete('/api/team/:id', requireAdmin, (req, res) => {
  mockData.team = mockData.team.filter(m => m.id !== parseInt(req.params.id));
  res.json({ success: true });
});

// === SERVICES ===
app.get('/api/services', (req, res) => {
  res.json(mockData.services);
});

app.post('/api/services', requireAdmin, (req, res) => {
  const newService = { id: mockData.services.length + 1, ...req.body };
  mockData.services.push(newService);
  res.status(201).json(newService);
});

app.get('/api/services/:id', (req, res) => {
  const service = mockData.services.find(s => s.id === parseInt(req.params.id));
  res.json(service || { error: 'Not found' });
});

app.put('/api/services/:id', requireAdmin, (req, res) => {
  const service = mockData.services.find(s => s.id === parseInt(req.params.id));
  if (!service) return res.status(404).json({ error: 'Not found' });
  Object.assign(service, req.body);
  res.json(service);
});

app.delete('/api/services/:id', requireAdmin, (req, res) => {
  mockData.services = mockData.services.filter(s => s.id !== parseInt(req.params.id));
  res.json({ success: true });
});

// === NEWS ===
app.get('/api/news', (req, res) => {
  res.json(mockData.news);
});

app.post('/api/news', requireAdmin, (req, res) => {
  const newNews = { id: mockData.news.length + 1, createdAt: new Date().toISOString(), ...req.body };
  mockData.news.push(newNews);
  res.status(201).json(newNews);
});

app.get('/api/news/:id', (req, res) => {
  const news = mockData.news.find(n => n.id === parseInt(req.params.id));
  res.json(news || { error: 'Not found' });
});

app.put('/api/news/:id', requireAdmin, (req, res) => {
  const news = mockData.news.find(n => n.id === parseInt(req.params.id));
  if (!news) return res.status(404).json({ error: 'Not found' });
  Object.assign(news, req.body);
  res.json(news);
});

app.delete('/api/news/:id', requireAdmin, (req, res) => {
  mockData.news = mockData.news.filter(n => n.id !== parseInt(req.params.id));
  res.json({ success: true });
});

// === PROJECTS ===
app.get('/api/projects', (req, res) => {
  res.json(mockData.projects);
});

app.post('/api/projects', requireAdmin, (req, res) => {
  const newProject = { id: mockData.projects.length + 1, ...req.body };
  mockData.projects.push(newProject);
  res.status(201).json(newProject);
});

app.get('/api/projects/:id', (req, res) => {
  const project = mockData.projects.find(p => p.id === parseInt(req.params.id));
  res.json(project || { error: 'Not found' });
});

app.put('/api/projects/:id', requireAdmin, (req, res) => {
  const project = mockData.projects.find(p => p.id === parseInt(req.params.id));
  if (!project) return res.status(404).json({ error: 'Not found' });
  Object.assign(project, req.body);
  res.json(project);
});

app.delete('/api/projects/:id', requireAdmin, (req, res) => {
  mockData.projects = mockData.projects.filter(p => p.id !== parseInt(req.params.id));
  res.json({ success: true });
});

// === TESTIMONIALS ===
app.get('/api/testimonials', (req, res) => {
  res.json(mockData.testimonials);
});

app.post('/api/testimonials', (req, res) => {
  const newTestimonial = { id: mockData.testimonials.length + 1, ...req.body };
  mockData.testimonials.push(newTestimonial);
  res.status(201).json(newTestimonial);
});

// === SOLUTIONS ===
app.get('/api/solutions', (req, res) => {
  res.json(mockData.solutions);
});

app.post('/api/solutions', requireAdmin, (req, res) => {
  const newSolution = { id: mockData.solutions.length + 1, ...req.body };
  mockData.solutions.push(newSolution);
  res.status(201).json(newSolution);
});

// === SETTINGS ===
app.get('/api/settings', (req, res) => {
  res.json(mockData.settings);
});

app.put('/api/settings', requireAdmin, (req, res) => {
  Object.assign(mockData.settings, req.body);
  res.json(mockData.settings);
});

// === FORMATIONS ===
app.get('/api/formations', (req, res) => {
  res.json(mockData.formations.filter(f => f.statut === 'active'));
});

app.get('/api/formations/all', requireAdmin, (req, res) => {
  res.json(mockData.formations);
});

app.post('/api/formations', requireAdmin, (req, res) => {
  const newFormation = { id: mockData.formations.length + 1, statut: 'active', ...req.body };
  mockData.formations.push(newFormation);
  res.status(201).json(newFormation);
});

app.get('/api/formations/:id', (req, res) => {
  const formation = mockData.formations.find(f => f.id === parseInt(req.params.id));
  res.json(formation || { error: 'Not found' });
});

app.put('/api/formations/:id', requireAdmin, (req, res) => {
  const formation = mockData.formations.find(f => f.id === parseInt(req.params.id));
  if (!formation) return res.status(404).json({ error: 'Not found' });
  Object.assign(formation, req.body);
  res.json(formation);
});

app.delete('/api/formations/:id', requireAdmin, (req, res) => {
  mockData.formations = mockData.formations.filter(f => f.id !== parseInt(req.params.id));
  res.json({ success: true });
});

// === INSCRIPTIONS-FORMATIONS ===
app.get('/api/inscriptions-formations', requireAdmin, (req, res) => {
  res.json(mockData.inscriptions);
});

app.post('/api/inscriptions-formations', (req, res) => {
  const newId = mockData.inscriptions.length + 1;
  const sequence = String(newId).padStart(4, '0');
  const numero_inscription = `TRU-FRM-${new Date().getFullYear()}-${sequence}`;
  const newInscription = {
    id: newId,
    numero_inscription,
    statut: 'en_attente',
    createdAt: new Date().toISOString(),
    ...req.body
  };
  mockData.inscriptions.push(newInscription);
  res.status(201).json(newInscription);
});

app.get('/api/inscriptions-formations/numero/:numero', (req, res) => {
  const inscription = mockData.inscriptions.find(i => i.numero_inscription === req.params.numero);
  res.json(inscription || { error: 'Not found' });
});

app.post('/api/inscriptions-formations/confirmer', (req, res) => {
  const { numero_inscription } = req.body;
  const inscription = mockData.inscriptions.find(i => i.numero_inscription === numero_inscription);
  if (!inscription) return res.status(404).json({ error: 'Not found' });
  inscription.statut = 'confirme';
  res.json(inscription);
});

app.put('/api/inscriptions-formations/:id', requireAdmin, (req, res) => {
  const inscription = mockData.inscriptions.find(i => i.id === parseInt(req.params.id));
  if (!inscription) return res.status(404).json({ error: 'Not found' });
  Object.assign(inscription, req.body);
  res.json(inscription);
});

app.delete('/api/inscriptions-formations/:id', requireAdmin, (req, res) => {
  mockData.inscriptions = mockData.inscriptions.filter(i => i.id !== parseInt(req.params.id));
  res.json({ success: true });
});

// === CONTACTS ===
app.get('/api/contacts', requireAdmin, (req, res) => {
  res.json(mockData.contacts);
});

app.post('/api/contacts', (req, res) => {
  const newContact = { id: mockData.contacts.length + 1, createdAt: new Date().toISOString(), ...req.body };
  mockData.contacts.push(newContact);
  res.status(201).json(newContact);
});

app.get('/api/contacts/:id', (req, res) => {
  const contact = mockData.contacts.find(c => c.id === parseInt(req.params.id));
  res.json(contact || { error: 'Not found' });
});

app.post('/api/contacts/reply', requireAdmin, (req, res) => {
  const { contactId, reply } = req.body;
  const contact = mockData.contacts.find(c => c.id === contactId);
  if (!contact) return res.status(404).json({ error: 'Not found' });
  contact.reply = reply;
  contact.repliedAt = new Date().toISOString();
  res.json(contact);
});

// === UPLOADS ===
app.post('/api/upload', (req, res) => {
  // Mock upload - return dummy base64 data URL
  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  res.json({ url: dataUrl });
});

app.post('/api/uploads/team-photo', (req, res) => {
  // Mock upload - return dummy base64 data URL
  const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  res.json({ url: dataUrl });
});

// === SYNC ===
app.get('/api/data', (req, res) => {
  res.json(mockData);
});

app.post('/api/sync/all', (req, res) => {
  // Replace all data
  Object.assign(mockData, req.body);
  res.json({ success: true, message: 'All data synced' });
});

app.post('/api/sync/batch', (req, res) => {
  // Process batch of updates
  const { updates } = req.body;
  if (!Array.isArray(updates)) {
    return res.status(400).json({ error: 'updates must be an array' });
  }
  res.json({ success: true, processed: updates.length });
});

// === LOGS ===
app.get('/api/logs', (req, res) => {
  res.json({ logs: mockData.logs });
});

app.post('/api/logs', (req, res) => {
  const { level, message, timestamp } = req.body;
  mockData.logs.push({ level, message, timestamp: timestamp || new Date().toISOString() });
  res.status(201).json({ success: true });
});

// === CONFIG ===
app.post('/api/config/increase-image-limit', requireAdmin, (req, res) => {
  const { newLimit } = req.body;
  mockData.settings.maxImageSize = newLimit || 10485760; // 10MB default
  res.json({ success: true, newLimit: mockData.settings.maxImageSize });
});

// === AUTH ===
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  // Mock login - accept any email/password
  const token = generateToken(1, email.includes('admin'));
  res.json({ token, user: { id: 1, email, isAdmin: email.includes('admin') } });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

// === ERROR HANDLER ===
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// ====== START SERVER ======
app.listen(PORT, () => {
  console.log(`\n✅ Mock Backend Server running on http://localhost:${PORT}`);
  console.log(`\n📚 Available endpoints:`);
  console.log(`   GET    /api/health`);
  console.log(`   GET    /api/team | POST | GET:id | PUT:id | DELETE:id`);
  console.log(`   GET    /api/services | POST | GET:id | PUT:id | DELETE:id`);
  console.log(`   GET    /api/news | POST | GET:id | PUT:id | DELETE:id`);
  console.log(`   GET    /api/projects | POST | GET:id | PUT:id | DELETE:id`);
  console.log(`   GET    /api/solutions | POST | GET:id | PUT:id | DELETE:id`);
  console.log(`   GET    /api/formations | GET:/all | POST | GET:id | PUT:id | DELETE:id`);
  console.log(`   GET    /api/inscriptions-formations | POST`);
  console.log(`   GET    /api/contacts | POST | GET:id | POST:/reply`);
  console.log(`   GET    /api/settings | PUT`);
  console.log(`   POST   /api/upload | POST:/uploads/team-photo`);
  console.log(`   GET    /api/data`);
  console.log(`   POST   /api/sync/all | POST:/sync/batch`);
  console.log(`   GET    /api/logs | POST`);
  console.log(`   POST   /api/auth/login | POST:/auth/logout`);
  console.log(`\n⚠️  This is a development server. No data persists.\n`);
});
