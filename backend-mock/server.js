/**
 * Mock Backend Server
 * 
 * Serves all API endpoints for frontend testing
 * without requiring external services (Supabase, etc.)
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ====== MOCK DATA ======
const mockData = {
  team: [
    { id: 1, name: 'Emmanuel Fokas', role: 'Founder', email: 'emmanuel@tru.group', photo: null, description: 'CEO & Founder' },
    { id: 2, name: 'John Doe', role: 'Manager', email: 'john@tru.group', photo: null, description: 'Operations Manager' }
  ],
  services: [
    { id: 1, title: 'Consulting', description: 'Strategic consulting services' },
    { id: 2, title: 'Training', description: 'Professional training programs' }
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
    maxImageSize: 5242880,
    theme: 'light'
  },
  formations: [
    { id: 1, titre: 'Formation 1', description: 'First training', statut: 'active', prix: 99.99, date_debut: '2025-04-01' }
  ],
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
  const newInscription = { id: mockData.inscriptions.length + 1, statut: 'actif', ...req.body };
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
