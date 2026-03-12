const db = require('../database/db');
const { v4: uuidv4 } = require('uuid');

// Validation helper
const validateIncident = (data) => {
  const errors = [];

  if (!data.title || data.title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push('Description is required');
  }

  if (!data.category) {
    errors.push('Category is required');
  }

  if (!data.latitude || !data.longitude) {
    errors.push('Location coordinates are required');
  }

  if (data.latitude < -90 || data.latitude > 90) {
    errors.push('Latitude must be between -90 and 90');
  }

  if (data.longitude < -180 || data.longitude > 180) {
    errors.push('Longitude must be between -180 and 180');
  }

  return errors;
};

// Create incident
const createIncident = async (req, res) => {
  try {
    const { title, description, category, latitude, longitude, severity } =
      req.body;
    const userId = req.user.id;

    // Validate input
    const errors = validateIncident({
      title,
      description,
      category,
      latitude,
      longitude,
    });

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
    }

    const incidentId = uuidv4();
    const status = 'pending';
    const points = 100; // Base points for reporting
    const severityLevel = severity || 'medium';

    // PostGIS POINT(longitude latitude)
    const locationPoint = `POINT(${longitude} ${latitude})`;

    const query = `
      INSERT INTO incidents (
        id, user_id, title, description, category, 
        location, severity, status, points, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, 
        ST_GeomFromText('${locationPoint}', 4326), $6, $7, $8, NOW()
      )
      RETURNING *;
    `;

    const result = await db.query(query, [
      incidentId,
      userId,
      title,
      description,
      category,
      severityLevel,
      status,
      points,
    ]);

    // Award points to user
    await db.query(
      `UPDATE users SET points = points + $1 WHERE id = $2`,
      [points, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Incident created successfully',
      incident: result.rows[0],
    });
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create incident',
      error: error.message,
    });
  }
};

// Get incidents with filtering
const getIncidents = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, status, userId } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT 
        id, user_id, title, description, category,
        ST_X(location) as longitude,
        ST_Y(location) as latitude,
        severity, status, points, created_at, updated_at
      FROM incidents
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 1;

    if (category) {
      query += ` AND category = $${paramCount++}`;
      params.push(category);
    }

    if (status) {
      query += ` AND status = $${paramCount++}`;
      params.push(status);
    }

    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount++} OFFSET $${paramCount++}`;
    params.push(parseInt(limit), offset);

    const result = await db.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM incidents WHERE 1=1';
    if (category) countQuery += ` AND category = $1`;
    if (status && category) countQuery += ` AND status = $2`;
    if (status && !category) countQuery += ` AND status = $1`;

    const countParams = [];
    if (category) countParams.push(category);
    if (status) countParams.push(status);

    const countResult = await db.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      incidents: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incidents',
      error: error.message,
    });
  }
};

// Get single incident
const getIncidentById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        id, user_id, title, description, category,
        ST_X(location) as longitude,
        ST_Y(location) as latitude,
        severity, status, points, created_at, updated_at
      FROM incidents
      WHERE id = $1;
    `;

    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    res.json({
      success: true,
      incident: result.rows[0],
    });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch incident',
      error: error.message,
    });
  }
};

// Update incident
const updateIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, severity, status, latitude, longitude } =
      req.body;
    const userId = req.user.id;

    // Check if incident exists and user owns it
    const checkQuery = `SELECT * FROM incidents WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    const incident = checkResult.rows[0];
    if (incident.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this incident',
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (title !== undefined) {
      updates.push(`title = $${paramCount++}`);
      values.push(title);
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }

    if (category !== undefined) {
      updates.push(`category = $${paramCount++}`);
      values.push(category);
    }

    if (severity !== undefined) {
      updates.push(`severity = $${paramCount++}`);
      values.push(severity);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (latitude !== undefined && longitude !== undefined) {
      const locationPoint = `POINT(${longitude} ${latitude})`;
      updates.push(`location = ST_GeomFromText('${locationPoint}', 4326)`);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE incidents
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *;
    `;

    const result = await db.query(query, values);

    res.json({
      success: true,
      message: 'Incident updated successfully',
      incident: result.rows[0],
    });
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update incident',
      error: error.message,
    });
  }
};

// Delete incident
const deleteIncident = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if incident exists and user owns it
    const checkQuery = `SELECT * FROM incidents WHERE id = $1`;
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Incident not found',
      });
    }

    const incident = checkResult.rows[0];
    if (incident.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this incident',
      });
    }

    // Delete associated photos first
    await db.query(`DELETE FROM incident_photos WHERE incident_id = $1`, [id]);

    // Delete incident
    await db.query(`DELETE FROM incidents WHERE id = $1`, [id]);

    res.json({
      success: true,
      message: 'Incident deleted successfully',
    });
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete incident',
      error: error.message,
    });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncidentById,
  updateIncident,
  deleteIncident,
};
