const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

// Mock auth middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    req.user = jwt.verify(token, 'your-secret-key');
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
};

// Mock incident controller
const createIncident = (req, res) => {
  const { title, description, category, latitude, longitude } = req.body;

  if (!title || !description || !category || !latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: ['Missing required fields'],
    });
  }

  res.status(201).json({
    success: true,
    message: 'Incident created successfully',
    incident: {
      id: '12345',
      user_id: req.user.id,
      title,
      description,
      category,
      latitude,
      longitude,
      severity: 'medium',
      status: 'pending',
      points: 100,
      created_at: new Date().toISOString(),
    },
  });
};

const getIncidents = (req, res) => {
  res.json({
    success: true,
    incidents: [
      {
        id: '1',
        user_id: 'user-1',
        title: 'Illegal Dumping',
        description: 'Waste dumped near river',
        category: 'pollution',
        latitude: 3.8667,
        longitude: 11.5167,
        severity: 'high',
        status: 'pending',
      },
    ],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
};

const getIncidentById = (req, res) => {
  const { id } = req.params;
  if (id === 'nonexistent') {
    return res.status(404).json({
      success: false,
      message: 'Incident not found',
    });
  }

  res.json({
    success: true,
    incident: {
      id,
      user_id: 'user-1',
      title: 'Test Incident',
      description: 'Test description',
      category: 'pollution',
      latitude: 3.8667,
      longitude: 11.5167,
      severity: 'medium',
      status: 'pending',
    },
  });
};

const updateIncident = (req, res) => {
  const { id } = req.params;
  if (id === 'nonexistent') {
    return res.status(404).json({
      success: false,
      message: 'Incident not found',
    });
  }

  res.json({
    success: true,
    message: 'Incident updated successfully',
    incident: { id, ...req.body, updated_at: new Date().toISOString() },
  });
};

const deleteIncident = (req, res) => {
  const { id } = req.params;
  if (id === 'nonexistent') {
    return res.status(404).json({
      success: false,
      message: 'Incident not found',
    });
  }

  res.json({
    success: true,
    message: 'Incident deleted successfully',
  });
};

// Routes
app.post('/api/incidents', authenticateToken, createIncident);
app.get('/api/incidents', authenticateToken, getIncidents);
app.get('/api/incidents/:id', authenticateToken, getIncidentById);
app.patch('/api/incidents/:id', authenticateToken, updateIncident);
app.delete('/api/incidents/:id', authenticateToken, deleteIncident);

// Tests
describe('Incidents API - SPRINT 2 Backend', () => {
  const validToken = jwt.sign(
    { id: 'user-1', phoneNumber: '+237612345678' },
    'your-secret-key'
  );

  const authHeader = { Authorization: `Bearer ${validToken}` };

  describe('POST /api/incidents - Create Incident', () => {
    test('Should create incident with valid data', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .set(authHeader)
        .send({
          title: 'Illegal Dumping',
          description: 'Waste near river',
          category: 'pollution',
          latitude: 3.8667,
          longitude: 11.5167,
          severity: 'high',
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.incident.title).toBe('Illegal Dumping');
      expect(response.body.incident.points).toBe(100);
    });

    test('Should fail without required fields', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .set(authHeader)
        .send({ title: 'Incomplete' });

      expect(response.statusCode).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    test('Should fail without authentication', async () => {
      const response = await request(app).post('/api/incidents').send({
        title: 'Test',
        description: 'Test',
        category: 'pollution',
        latitude: 0,
        longitude: 0,
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('GET /api/incidents - List Incidents', () => {
    test('Should return incidents list', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set(authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.incidents)).toBe(true);
      expect(response.body.pagination).toBeDefined();
    });

    test('Should filter by category', async () => {
      const response = await request(app)
        .get('/api/incidents?category=pollution')
        .set(authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Should support pagination', async () => {
      const response = await request(app)
        .get('/api/incidents?page=1&limit=10')
        .set(authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(10);
    });
  });

  describe('GET /api/incidents/:id - Get Single Incident', () => {
    test('Should return incident by ID', async () => {
      const response = await request(app)
        .get('/api/incidents/123')
        .set(authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.incident.id).toBe('123');
    });

    test('Should return 404 for nonexistent incident', async () => {
      const response = await request(app)
        .get('/api/incidents/nonexistent')
        .set(authHeader);

      expect(response.statusCode).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PATCH /api/incidents/:id - Update Incident', () => {
    test('Should update incident', async () => {
      const response = await request(app)
        .patch('/api/incidents/123')
        .set(authHeader)
        .send({ status: 'resolved', severity: 'low' });

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.incident.status).toBe('resolved');
    });

    test('Should return 404 for nonexistent incident', async () => {
      const response = await request(app)
        .patch('/api/incidents/nonexistent')
        .set(authHeader)
        .send({ status: 'resolved' });

      expect(response.statusCode).toBe(404);
    });
  });

  describe('DELETE /api/incidents/:id - Delete Incident', () => {
    test('Should delete incident', async () => {
      const response = await request(app)
        .delete('/api/incidents/123')
        .set(authHeader);

      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('Should return 404 for nonexistent incident', async () => {
      const response = await request(app)
        .delete('/api/incidents/nonexistent')
        .set(authHeader);

      expect(response.statusCode).toBe(404);
    });
  });

  describe('Authentication - All Incident Routes', () => {
    test('Should reject requests without token', async () => {
      const response = await request(app).get('/api/incidents');

      expect(response.statusCode).toBe(401);
    });

    test('Should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/incidents')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.statusCode).toBe(403);
    });
  });
});
