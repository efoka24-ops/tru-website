import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, 'data.json');

// Middleware
app.use(cors());
app.use(express.json());

// Utility functions
function readData() {
  try {
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Erreur lecture data.json:', err);
    return { users: [], services: [], content: [], contacts: [], team: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    console.error('Erreur écriture data.json:', err);
    return false;
  }
}

// Routes Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Services Routes
app.get('/api/services', (req, res) => {
  const data = readData();
  res.json(data.services);
});

app.post('/api/services', (req, res) => {
  const data = readData();
  const newService = {
    id: Math.max(...data.services.map(s => s.id), 0) + 1,
    ...req.body
  };
  data.services.push(newService);
  if (writeData(data)) {
    res.status(201).json(newService);
  } else {
    res.status(500).json({ error: 'Erreur d\'écriture' });
  }
});

app.put('/api/services/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.services.findIndex(s => s.id === id);
  if (index !== -1) {
    data.services[index] = { ...data.services[index], ...req.body, id };
    if (writeData(data)) {
      res.json(data.services[index]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Service non trouvé' });
  }
});

app.delete('/api/services/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.services.findIndex(s => s.id === id);
  if (index !== -1) {
    const deleted = data.services.splice(index, 1);
    if (writeData(data)) {
      res.json(deleted[0]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Service non trouvé' });
  }
});

// Content Routes
app.get('/api/content', (req, res) => {
  const data = readData();
  res.json(data.content);
});

app.post('/api/content', (req, res) => {
  const data = readData();
  const newContent = {
    id: Math.max(...data.content.map(c => c.id), 0) + 1,
    ...req.body
  };
  data.content.push(newContent);
  if (writeData(data)) {
    res.status(201).json(newContent);
  } else {
    res.status(500).json({ error: 'Erreur d\'écriture' });
  }
});

app.put('/api/content/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.content.findIndex(c => c.id === id);
  if (index !== -1) {
    data.content[index] = { ...data.content[index], ...req.body, id };
    if (writeData(data)) {
      res.json(data.content[index]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Contenu non trouvé' });
  }
});

app.delete('/api/content/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.content.findIndex(c => c.id === id);
  if (index !== -1) {
    const deleted = data.content.splice(index, 1);
    if (writeData(data)) {
      res.json(deleted[0]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Contenu non trouvé' });
  }
});

// Team Routes
app.get('/api/team', (req, res) => {
  const data = readData();
  res.json(data.team);
});

app.post('/api/team', (req, res) => {
  const data = readData();
  const newMember = {
    id: Math.max(...data.team.map(t => t.id), 0) + 1,
    ...req.body
  };
  data.team.push(newMember);
  if (writeData(data)) {
    res.status(201).json(newMember);
  } else {
    res.status(500).json({ error: 'Erreur d\'écriture' });
  }
});

app.put('/api/team/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.team.findIndex(t => t.id === id);
  if (index !== -1) {
    data.team[index] = { ...data.team[index], ...req.body, id };
    if (writeData(data)) {
      res.json(data.team[index]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Membre non trouvé' });
  }
});

app.delete('/api/team/:id', (req, res) => {
  const data = readData();
  const id = parseInt(req.params.id);
  const index = data.team.findIndex(t => t.id === id);
  if (index !== -1) {
    const deleted = data.team.splice(index, 1);
    if (writeData(data)) {
      res.json(deleted[0]);
    } else {
      res.status(500).json({ error: 'Erreur d\'écriture' });
    }
  } else {
    res.status(404).json({ error: 'Membre non trouvé' });
  }
});

// Sync Route
app.post('/api/sync', (req, res) => {
  const data = readData();
  res.json({ 
    status: 'success',
    message: 'Données synchronisées',
    timestamp: new Date().toISOString(),
    data: data
  });
});

app.get('/api/sync/status', (req, res) => {
  const data = readData();
  res.json({
    status: 'online',
    lastSync: new Date().toISOString(),
    dataCount: {
      services: data.services.length,
      content: data.content.length,
      team: data.team.length
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API Health: http://localhost:${PORT}/api/health`);
});
