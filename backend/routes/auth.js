/**
 * Authentication Routes
 * Routes pour login, logout, register, etc.
 */

import express from 'express';
import * as auth from '../lib/auth.js';
import * as db from '../lib/supabase.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email et mot de passe requis'
      });
    }

    // Récupérer l'utilisateur depuis Supabase
    const { data: users, error } = await db.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !users) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Vérifier si l'utilisateur est actif
    if (!users.active) {
      return res.status(403).json({
        success: false,
        error: 'Compte désactivé'
      });
    }

    // Vérifier le mot de passe
    const isValidPassword = await auth.verifyPassword(password, users.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Email ou mot de passe incorrect'
      });
    }

    // Générer le token JWT
    const token = auth.generateToken({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role
    });

    // Retourner les infos utilisateur (sans le mot de passe)
    const { password_hash, ...userWithoutPassword } = users;

    res.json({
      success: true,
      token: token,
      user: userWithoutPassword,
      expiresIn: '7d'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la connexion'
    });
  }
});

/**
 * POST /api/auth/register
 * Inscription utilisateur (désactivé par défaut, à activer si besoin)
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        error: 'Tous les champs sont requis'
      });
    }

    // Valider le mot de passe
    const passwordValidation = auth.validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe non valide',
        details: passwordValidation.errors
      });
    }

    // Vérifier si l'email existe déjà
    const { data: existingUser } = await db.supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Cet email est déjà utilisé'
      });
    }

    // Hasher le mot de passe
    const hashedPassword = await auth.hashPassword(password);

    // Créer l'utilisateur
    const { data: newUser, error } = await db.supabase
      .from('users')
      .insert([{
        email,
        password_hash: hashedPassword,
        name,
        role: 'user',
        active: true
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Générer le token
    const token = auth.generateToken({
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role
    });

    // Retourner sans le mot de passe
    const { password_hash, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token,
        expiresIn: '7d'
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'inscription'
    });
  }
});

/**
 * GET /api/auth/me
 * Obtenir les infos de l'utilisateur connecté
 */
router.get('/me', auth.authenticateToken, async (req, res) => {
  try {
    const { data: user, error } = await db.supabase
      .from('users')
      .select('id, email, name, role, active, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des données'
    });
  }
});

/**
 * PUT /api/auth/change-password
 * Changer le mot de passe
 */
router.put('/change-password', auth.authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Mot de passe actuel et nouveau requis'
      });
    }

    // Valider le nouveau mot de passe
    const passwordValidation = auth.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Nouveau mot de passe non valide',
        details: passwordValidation.errors
      });
    }

    // Récupérer l'utilisateur actuel
    const { data: user, error } = await db.supabase
      .from('users')
      .select('password_hash')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({
        success: false,
        error: 'Utilisateur non trouvé'
      });
    }

    // Vérifier le mot de passe actuel
    const isValidPassword = await auth.verifyPassword(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Mot de passe actuel incorrect'
      });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await auth.hashPassword(newPassword);

    // Mettre à jour
    await db.supabase
      .from('users')
      .update({ password_hash: hashedPassword })
      .eq('id', req.user.id);

    res.json({
      success: true,
      message: 'Mot de passe changé avec succès'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du changement de mot de passe'
    });
  }
});

/**
 * POST /api/auth/logout
 * Déconnexion (côté client, invalider le token)
 */
router.post('/logout', auth.authenticateToken, (req, res) => {
  // Le token sera supprimé côté client
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

export default router;
