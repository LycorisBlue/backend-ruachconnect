const express = require('express');
const router = express.Router();

const FollowUpController = require('../controllers/FollowUpController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  createFollowUpValidation,
  getFollowUpsQueryValidation,
  followUpStatsValidation,
  overdueQueryValidation,
  upcomingActionsValidation
} = require('../validators/followUpValidators');

/**
 * @swagger
 * /follow-ups:
 *   post:
 *     tags: [Follow-ups]
 *     summary: Enregistrer une interaction de suivi
 *     description: Crée un nouvel enregistrement d'interaction entre un mentor et un visiteur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFollowUpRequest'
 *           example:
 *             personId: "12345678-1234-1234-1234-123456789012"
 *             interactionType: "visit"
 *             interactionDate: "2024-01-25"
 *             notes: "Visite à domicile réussie, famille accueillante"
 *             outcome: "positive"
 *             nextActionNeeded: true
 *             nextActionDate: "2024-02-01"
 *             nextActionNotes: "Inviter à l'étude biblique"
 *     responses:
 *       201:
 *         description: Suivi enregistré avec succès
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
 *                         personId:
 *                           type: string
 *                           format: uuid
 *                         mentorId:
 *                           type: string
 *                           format: uuid
 *                         interactionType:
 *                           type: string
 *                           enum: [visit, call, meeting, other]
 *                         interactionDate:
 *                           type: string
 *                           format: date
 *                         outcome:
 *                           type: string
 *                           enum: [positive, neutral, negative, no_contact]
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Suivi enregistré avec succès"
 *               data:
 *                 id: "11111111-1111-1111-1111-111111111111"
 *                 personId: "12345678-1234-1234-1234-123456789012"
 *                 mentorId: "87654321-4321-4321-4321-210987654321"
 *                 interactionType: "visit"
 *                 interactionDate: "2024-01-25"
 *                 outcome: "positive"
 *                 createdAt: "2024-01-25T18:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Visiteur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "NOT_FOUND"
 *                 message: "Visiteur non trouvé"
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/',
  authenticateToken,
  requireRole(['mentor', 'pastor', 'admin']),
  createFollowUpValidation,
  handleValidationErrors,
  FollowUpController.createFollowUp
);

/**
 * @swagger
 * /follow-ups:
 *   get:
 *     tags: [Follow-ups]
 *     summary: Liste des suivis avec filtres
 *     description: Récupère l'historique des interactions de suivi avec options de filtrage
 *     parameters:
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
 *       - in: query
 *         name: person_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par visiteur
 *       - in: query
 *         name: mentor_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par mentor
 *       - in: query
 *         name: interaction_type
 *         schema:
 *           type: string
 *           enum: [visit, call, meeting, other]
 *         description: Filtrer par type d'interaction
 *       - in: query
 *         name: outcome
 *         schema:
 *           type: string
 *           enum: [positive, neutral, negative, no_contact]
 *         description: Filtrer par résultat
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début (YYYY-MM-DD)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Liste des suivis récupérée avec succès
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
 *                         followUps:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/FollowUp'
 *                               - type: object
 *                                 properties:
 *                                   person:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: string
 *                                         format: uuid
 *                                       firstName:
 *                                         type: string
 *                                       lastName:
 *                                         type: string
 *                                   mentor:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: string
 *                                         format: uuid
 *                                       firstName:
 *                                         type: string
 *                                       lastName:
 *                                         type: string
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
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  getFollowUpsQueryValidation,
  handleValidationErrors,
  FollowUpController.getFollowUps
);

/**
 * GET /follow-ups/stats - Statistiques de suivi par mentor
 * Rôles autorisés: Mentor (ses stats), Pastor, Admin
 */
router.get('/stats',
  authenticateToken,
  requireRole(['mentor', 'pastor', 'admin']),
  followUpStatsValidation,
  handleValidationErrors,
  FollowUpController.getFollowUpStats
);

/**
 * @swagger
 * /follow-ups/overdue:
 *   get:
 *     tags: [Follow-ups]
 *     summary: Suivis en retard
 *     description: Récupère la liste des visiteurs qui nécessitent un suivi depuis trop longtemps
 *     parameters:
 *       - in: query
 *         name: days_threshold
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 7
 *         description: Nombre de jours de retard minimum
 *       - in: query
 *         name: mentor_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par mentor (optionnel)
 *     responses:
 *       200:
 *         description: Liste des suivis en retard récupérée avec succès
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
 *                         overdueFollowUps:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               person:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   firstName:
 *                                     type: string
 *                                   lastName:
 *                                     type: string
 *                                   status:
 *                                     type: string
 *                                     enum: [to_visit, in_follow_up, integrated, to_redirect, long_absent]
 *                               assignedMentor:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   firstName:
 *                                     type: string
 *                                   lastName:
 *                                     type: string
 *                               daysSinceLastInteraction:
 *                                 type: integer
 *                                 description: Nombre de jours depuis la dernière interaction
 *                               lastInteractionDate:
 *                                 type: string
 *                                 format: date
 *                                 description: Date de la dernière interaction
 *                         total:
 *                           type: integer
 *                           description: Nombre total de suivis en retard
 *             example:
 *               success: true
 *               message: "Suivis en retard récupérés avec succès"
 *               data:
 *                 overdueFollowUps:
 *                   - person:
 *                       id: "12345678-1234-1234-1234-123456789012"
 *                       firstName: "Marie"
 *                       lastName: "Kouassi"
 *                       status: "in_follow_up"
 *                     assignedMentor:
 *                       id: "87654321-4321-4321-4321-210987654321"
 *                       firstName: "Jean"
 *                       lastName: "Dupont"
 *                     daysSinceLastInteraction: 10
 *                     lastInteractionDate: "2024-01-15"
 *                 total: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/overdue',
  authenticateToken,
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  overdueQueryValidation,
  handleValidationErrors,
  FollowUpController.getOverdueFollowUps
);

/**
 * GET /follow-ups/upcoming-actions - Prochaines actions programmées
 * Rôles autorisés: Mentor (ses actions), Pastor, Admin
 */
router.get('/upcoming-actions',
  authenticateToken,
  requireRole(['mentor', 'pastor', 'admin']),
  upcomingActionsValidation,
  handleValidationErrors,
  FollowUpController.getUpcomingActions
);

module.exports = router;