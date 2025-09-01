const express = require('express');
const router = express.Router();

const UserController = require('../controllers/UserController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  createUserValidation,
  updateUserValidation,
  userIdValidation,
  getUsersQueryValidation
} = require('../validators/userValidators');

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Liste des utilisateurs du système
 *     description: Récupère la liste des utilisateurs avec options de filtrage par rôle et statut
 *     parameters:
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [can_committee, mentor, pastor, admin]
 *         description: Filtrer par rôle d'utilisateur
 *       - in: query
 *         name: is_active
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *           default: 'true'
 *         description: Filtrer par statut actif/inactif
 *       - in: query
 *         name: church_section
 *         schema:
 *           type: string
 *         description: Filtrer par section d'église
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans nom, prénom ou email
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
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
 *                         users:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/User'
 *                               - type: object
 *                                 properties:
 *                                   assignedPersonsCount:
 *                                     type: integer
 *                                     description: Nombre de visiteurs assignés (pour les mentors)
 *                                   lastLogin:
 *                                     type: string
 *                                     format: date-time
 *                                     description: Dernière connexion
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             currentPage:
 *                               type: integer
 *                             totalPages:
 *                               type: integer
 *                             totalItems:
 *                               type: integer
 *                             perPage:
 *                               type: integer
 *             example:
 *               success: true
 *               message: "Utilisateurs récupérés avec succès"
 *               data:
 *                 users:
 *                   - id: "87654321-4321-4321-4321-210987654321"
 *                     email: "mentor@ruach.church"
 *                     firstName: "Jean"
 *                     lastName: "Dupont"
 *                     phone: "+225 01 02 03 04 05"
 *                     role: "mentor"
 *                     churchSection: "Jeunes"
 *                     isActive: true
 *                     assignedPersonsCount: 5
 *                     createdAt: "2024-01-10T08:00:00.000Z"
 *                     updatedAt: "2024-01-20T10:15:00.000Z"
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 2
 *                   totalItems: 25
 *                   perPage: 20
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/',
  authenticateToken,
  requireRole(['can_committee', 'pastor', 'admin']),
  getUsersQueryValidation,
  handleValidationErrors,
  UserController.getUsers
);

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Créer un nouvel utilisateur
 *     description: Crée un nouveau compte utilisateur dans le système (réservé aux administrateurs)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *               - role
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Adresse email unique (servira d'identifiant)
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: Mot de passe (minimum 6 caractères)
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Prénom de l'utilisateur
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nom de famille de l'utilisateur
 *               phone:
 *                 type: string
 *                 description: Numéro de téléphone
 *               role:
 *                 type: string
 *                 enum: [can_committee, mentor, pastor, admin]
 *                 description: Rôle de l'utilisateur dans le système
 *               churchSection:
 *                 type: string
 *                 maxLength: 100
 *                 description: Section d'église responsable (optionnel)
 *           example:
 *             email: "nouveau.mentor@ruach.church"
 *             password: "motdepasse123"
 *             firstName: "Marie"
 *             lastName: "Claire"
 *             phone: "+225 07 08 09 10 11"
 *             role: "mentor"
 *             churchSection: "Adultes"
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
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
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         email:
 *                           type: string
 *                           format: email
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         role:
 *                           type: string
 *                           enum: [can_committee, mentor, pastor, admin]
 *                         churchSection:
 *                           type: string
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Utilisateur créé avec succès"
 *               data:
 *                 id: "99887766-5544-3322-1100-998877665544"
 *                 email: "nouveau.mentor@ruach.church"
 *                 firstName: "Marie"
 *                 lastName: "Claire"
 *                 role: "mentor"
 *                 churchSection: "Adultes"
 *                 isActive: true
 *                 createdAt: "2024-01-25T14:30:00.000Z"
 *       400:
 *         description: Erreur de validation ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               validation_error:
 *                 summary: Erreurs de validation
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "VALIDATION_ERROR"
 *                     message: "Données invalides"
 *                     details:
 *                       - field: "email"
 *                         message: "Format email invalide"
 *                       - field: "password"
 *                         message: "Mot de passe trop court (minimum 6 caractères)"
 *               email_exists:
 *                 summary: Email déjà utilisé
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "EMAIL_ALREADY_EXISTS"
 *                     message: "Cette adresse email est déjà utilisée"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/',
  authenticateToken,
  requireRole(['admin']),
  createUserValidation,
  handleValidationErrors,
  UserController.createUser
);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Modifier un utilisateur
 *     description: Met à jour les informations d'un utilisateur existant (réservé aux administrateurs)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID unique de l'utilisateur à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Nouvelle adresse email (doit être unique)
 *               firstName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nouveau prénom
 *               lastName:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 description: Nouveau nom de famille
 *               phone:
 *                 type: string
 *                 description: Nouveau numéro de téléphone
 *               role:
 *                 type: string
 *                 enum: [can_committee, mentor, pastor, admin]
 *                 description: Nouveau rôle utilisateur
 *               churchSection:
 *                 type: string
 *                 maxLength: 100
 *                 description: Nouvelle section d'église
 *               isActive:
 *                 type: boolean
 *                 description: Statut actif/inactif de l'utilisateur
 *           example:
 *             firstName: "Marie-Claire"
 *             lastName: "Dupont-Martin"
 *             phone: "+225 07 08 09 10 12"
 *             churchSection: "Femmes"
 *             isActive: true
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
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
 *               message: "Utilisateur modifié avec succès"
 *               data:
 *                 id: "99887766-5544-3322-1100-998877665544"
 *                 email: "marie.dupont@ruach.church"
 *                 firstName: "Marie-Claire"
 *                 lastName: "Dupont-Martin"
 *                 phone: "+225 07 08 09 10 12"
 *                 role: "mentor"
 *                 churchSection: "Femmes"
 *                 isActive: true
 *                 createdAt: "2024-01-20T10:00:00.000Z"
 *                 updatedAt: "2024-01-25T16:45:00.000Z"
 *       400:
 *         description: Erreur de validation ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               validation_error:
 *                 summary: Données invalides
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "VALIDATION_ERROR"
 *                     message: "Données invalides"
 *                     details:
 *                       - field: "email"
 *                         message: "Format email invalide"
 *               email_exists:
 *                 summary: Email déjà utilisé
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "EMAIL_ALREADY_EXISTS"
 *                     message: "Cette adresse email est déjà utilisée par un autre utilisateur"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Utilisateur non trouvé"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id',
  authenticateToken,
  requireRole(['admin']),
  userIdValidation,
  updateUserValidation,
  handleValidationErrors,
  UserController.updateUser
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Désactiver un utilisateur
 *     description: Désactive un utilisateur (suppression logique) tout en préservant ses données historiques
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID unique de l'utilisateur à désactiver
 *     responses:
 *       200:
 *         description: Utilisateur désactivé avec succès
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
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         isActive:
 *                           type: boolean
 *                           example: false
 *                         deactivatedAt:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Utilisateur désactivé avec succès"
 *               data:
 *                 id: "99887766-5544-3322-1100-998877665544"
 *                 isActive: false
 *                 deactivatedAt: "2024-01-25T17:00:00.000Z"
 *       400:
 *         description: ID utilisateur invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "BAD_REQUEST"
 *                 message: "ID utilisateur invalide"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Permissions insuffisantes ou tentative de désactivation de son propre compte
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               forbidden:
 *                 summary: Accès refusé
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "FORBIDDEN"
 *                     message: "Accès refusé pour ce rôle"
 *               self_deactivation:
 *                 summary: Auto-désactivation interdite
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "CANNOT_DEACTIVATE_SELF"
 *                     message: "Vous ne pouvez pas désactiver votre propre compte"
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Utilisateur non trouvé"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.delete('/:id',
  authenticateToken,
  requireRole(['admin']),
  userIdValidation,
  handleValidationErrors,
  UserController.deactivateUser
);

/**
 * @swagger
 * /users/mentors:
 *   get:
 *     tags: [Users]
 *     summary: Liste des mentors disponibles
 *     description: Récupère la liste des mentors actifs avec leur charge de travail pour faciliter l'attribution
 *     responses:
 *       200:
 *         description: Liste des mentors récupérée avec succès
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
 *                         mentors:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               firstName:
 *                                 type: string
 *                               lastName:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                                 format: email
 *                               phone:
 *                                 type: string
 *                               churchSection:
 *                                 type: string
 *                               assignedPersonsCount:
 *                                 type: integer
 *                                 description: Nombre de visiteurs actuellement assignés
 *                               maxPersonsAllowed:
 *                                 type: integer
 *                                 description: Nombre maximum de visiteurs autorisés
 *                               workload:
 *                                 type: string
 *                                 enum: [light, normal, heavy, full]
 *                                 description: Niveau de charge de travail
 *                               isAvailable:
 *                                 type: boolean
 *                                 description: Disponible pour de nouveaux visiteurs
 *                         totalMentors:
 *                           type: integer
 *                           description: Nombre total de mentors actifs
 *                         availableMentors:
 *                           type: integer
 *                           description: Nombre de mentors disponibles pour de nouveaux visiteurs
 *             example:
 *               success: true
 *               message: "Mentors disponibles récupérés avec succès"
 *               data:
 *                 mentors:
 *                   - id: "87654321-4321-4321-4321-210987654321"
 *                     firstName: "Jean"
 *                     lastName: "Dupont"
 *                     email: "jean.dupont@ruach.church"
 *                     phone: "+225 01 02 03 04 05"
 *                     churchSection: "Jeunes"
 *                     assignedPersonsCount: 3
 *                     maxPersonsAllowed: 10
 *                     workload: "light"
 *                     isAvailable: true
 *                   - id: "11223344-5566-7788-9900-112233445566"
 *                     firstName: "Marie"
 *                     lastName: "Claire"
 *                     email: "marie.claire@ruach.church"
 *                     phone: "+225 06 07 08 09 10"
 *                     churchSection: "Femmes"
 *                     assignedPersonsCount: 8
 *                     maxPersonsAllowed: 10
 *                     workload: "normal"
 *                     isAvailable: true
 *                 totalMentors: 8
 *                 availableMentors: 6
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/mentors',
  authenticateToken,
  requireRole(['can_committee', 'pastor', 'admin']),
  UserController.getAvailableMentors
);

module.exports = router;
