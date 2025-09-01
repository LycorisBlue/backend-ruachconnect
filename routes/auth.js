const express = require('express');
const router = express.Router();

const AuthController = require('../controllers/AuthController');
const { authenticateToken } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const { handleValidationErrors } = require('../middleware/validation');
const { 
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../validators/authValidators');

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Connexion utilisateur
 *     description: Authentifie un utilisateur avec email et mot de passe et retourne un token JWT
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@ruach.church"
 *             password: "admin123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         token:
 *                           type: string
 *                           description: Token JWT pour l'authentification
 *                         user:
 *                           $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Connexion réussie"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   id: "12345678-1234-1234-1234-123456789012"
 *                   email: "admin@ruach.church"
 *                   firstName: "Admin"
 *                   lastName: "System"
 *                   role: "admin"
 *                   churchSection: null
 *                   isActive: true
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Identifiants incorrects
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "INVALID_CREDENTIALS"
 *                 message: "Email ou mot de passe incorrect"
 *       429:
 *         description: Trop de tentatives de connexion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "TOO_MANY_REQUESTS"
 *                 message: "Trop de tentatives de connexion. Réessayez dans 15 minutes."
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/login',
  authLimiter,
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Déconnexion utilisateur
 *     description: Invalide le token JWT de l'utilisateur connecté
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Déconnexion réussie"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/logout',
  authenticateToken,
  AuthController.logout
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Profil utilisateur connecté
 *     description: Récupère les informations du profil de l'utilisateur authentifié
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Profil récupéré avec succès"
 *               data:
 *                 id: "12345678-1234-1234-1234-123456789012"
 *                 email: "mentor@ruach.church"
 *                 firstName: "Jean"
 *                 lastName: "Dupont"
 *                 phone: "+225 01 02 03 04 05"
 *                 role: "mentor"
 *                 churchSection: "Jeunes"
 *                 isActive: true
 *                 createdAt: "2024-01-15T10:00:00.000Z"
 *                 updatedAt: "2024-01-20T14:30:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/me',
  authenticateToken,
  AuthController.getProfile
);

/**
 * PUT /auth/profile - Mise à jour profil
 */
router.put('/profile',
  authenticateToken,
  updateProfileValidation,
  handleValidationErrors,
  AuthController.updateProfile
);

/**
 * POST /auth/change-password - Changement mot de passe
 */
router.post('/change-password',
  authenticateToken,
  changePasswordValidation,
  handleValidationErrors,
  AuthController.changePassword
);

module.exports = router;