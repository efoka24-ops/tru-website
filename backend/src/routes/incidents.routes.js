const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
} = require('../controllers/incidents.controller');

// All incident routes require authentication
router.use(authenticateToken);

// POST /api/incidents - Create new incident
router.post('/', createIncident);

// GET /api/incidents - List incidents (with pagination and filters)
router.get('/', getIncidents);

// GET /api/incidents/:id - Get specific incident
router.get('/:id', getIncidentById);

// PATCH /api/incidents/:id - Update incident
router.patch('/:id', updateIncident);

// DELETE /api/incidents/:id - Delete incident
router.delete('/:id', deleteIncident);

module.exports = router;
