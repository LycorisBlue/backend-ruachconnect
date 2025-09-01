const express = require('express');
const router = express.Router();

const PersonController = require('../controllers/PersonController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const {
  createPersonValidation,
  updatePersonValidation,
  updateStatusValidation,
  assignMentorValidation,
  personIdValidation,
  getPersonsQueryValidation
} = require('../validators/personValidators');

/**
 * @swagger
 * /persons:
 *   post:
 *     tags: [Persons]
 *     summary: Enregistrer un nouveau visiteur
 *     description: Crée un nouvel enregistrement de visiteur avec attribution automatique d'un mentor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePersonRequest'
 *           example:
 *             firstName: "Marie"
 *             lastName: "Kouassi"
 *             gender: "F"
 *             phone: "+225 01 02 03 04 05"
 *             email: "marie@example.com"
 *             commune: "Cocody"
 *             quartier: "Riviera"
 *             profession: "Enseignante"
 *             maritalStatus: "single"
 *             firstVisitDate: "2024-01-15"
 *             howHeardAboutChurch: "Invitée par une amie"
 *             prayerRequests: "Prière pour sa famille"
 *     responses:
 *       201:
 *         description: Visiteur enregistré avec succès
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
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         status:
 *                           type: string
 *                           enum: [to_visit]
 *                         assignedMentor:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               format: uuid
 *                             firstName:
 *                               type: string
 *                             lastName:
 *                               type: string
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *             example:
 *               success: true
 *               message: "Visiteur enregistré avec succès"
 *               data:
 *                 id: "12345678-1234-1234-1234-123456789012"
 *                 firstName: "Marie"
 *                 lastName: "Kouassi"
 *                 status: "to_visit"
 *                 assignedMentor:
 *                   id: "87654321-4321-4321-4321-210987654321"
 *                   firstName: "Jean"
 *                   lastName: "Dupont"
 *                 createdAt: "2024-01-15T10:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/',
  authenticateToken,
  requireRole(['can_committee', 'pastor', 'admin']),
  createPersonValidation,
  handleValidationErrors,
  PersonController.createPerson
);

/**
 * @swagger
 * /persons:
 *   get:
 *     tags: [Persons]
 *     summary: Liste des visiteurs avec filtres et pagination
 *     description: Récupère la liste des visiteurs avec options de filtrage par statut, mentor, commune, etc.
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [to_visit, in_follow_up, integrated, to_redirect, long_absent]
 *         description: Filtrer par statut
 *       - in: query
 *         name: mentor_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrer par mentor assigné
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans nom/prénom
 *       - in: query
 *         name: commune
 *         schema:
 *           type: string
 *         description: Filtrer par commune
 *       - in: query
 *         name: date_from
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de première visite (début)
 *       - in: query
 *         name: date_to
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de première visite (fin)
 *     responses:
 *       200:
 *         description: Liste des visiteurs récupérée avec succès
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
 *                         persons:
 *                           type: array
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Person'
 *                               - type: object
 *                                 properties:
 *                                   assignedMentor:
 *                                     type: object
 *                                     properties:
 *                                       id:
 *                                         type: string
 *                                         format: uuid
 *                                       firstName:
 *                                         type: string
 *                                       lastName:
 *                                         type: string
 *                                   lastInteraction:
 *                                     type: string
 *                                     format: date
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
  getPersonsQueryValidation,
  handleValidationErrors,
  PersonController.getPersons
);

/**
 * @swagger
 * /persons/{id}:
 *   get:
 *     tags: [Persons]
 *     summary: Détails d'un visiteur
 *     description: Récupère les informations complètes d'un visiteur avec son historique de suivi
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID unique du visiteur
 *     responses:
 *       200:
 *         description: Détails du visiteur récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Person'
 *                         - type: object
 *                           properties:
 *                             assignedMentor:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   format: uuid
 *                                 firstName:
 *                                   type: string
 *                                 lastName:
 *                                   type: string
 *                                 phone:
 *                                   type: string
 *                                 churchSection:
 *                                   type: string
 *                             followUps:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                     format: uuid
 *                                   interactionDate:
 *                                     type: string
 *                                     format: date
 *                                   interactionType:
 *                                     type: string
 *                                     enum: [visit, call, meeting, other]
 *                                   notes:
 *                                     type: string
 *                                   outcome:
 *                                     type: string
 *                                     enum: [positive, neutral, negative, no_contact]
 *                                   mentorName:
 *                                     type: string
 *             example:
 *               success: true
 *               message: "Détails du visiteur récupérés avec succès"
 *               data:
 *                 id: "12345678-1234-1234-1234-123456789012"
 *                 firstName: "Marie"
 *                 lastName: "Kouassi"
 *                 gender: "F"
 *                 phone: "+225 01 02 03 04 05"
 *                 email: "marie@example.com"
 *                 commune: "Cocody"
 *                 status: "in_follow_up"
 *                 assignedMentor:
 *                   id: "87654321-4321-4321-4321-210987654321"
 *                   firstName: "Jean"
 *                   lastName: "Dupont"
 *                   phone: "+225 06 07 08 09 10"
 *                   churchSection: "Jeunes"
 *                 followUps:
 *                   - id: "11111111-1111-1111-1111-111111111111"
 *                     interactionDate: "2024-01-20"
 *                     interactionType: "call"
 *                     notes: "Premier contact téléphonique positif"
 *                     outcome: "positive"
 *                     mentorName: "Jean Dupont"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/:id',
  authenticateToken,
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  personIdValidation,
  handleValidationErrors,
  PersonController.getPersonById
);

/**
 * PUT /persons/:id - Modifier informations visiteur
 * Rôles autorisés: CAN Committee, Mentor (ses assignés), Pastor, Admin
 */
router.put('/:id',
  authenticateToken,
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  personIdValidation,
  updatePersonValidation,
  handleValidationErrors,
  PersonController.updatePerson
);

/**
 * PUT /persons/:id/status - Changer statut visiteur
 * Rôles autorisés: CAN Committee, Mentor (ses assignés), Pastor, Admin
 */
router.put('/:id/status',
  authenticateToken,
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  personIdValidation,
  updateStatusValidation,
  handleValidationErrors,
  PersonController.updatePersonStatus
);

/**
 * PUT /persons/:id/assign-mentor - Assigner/réassigner mentor
 * Rôles autorisés: CAN Committee, Pastor, Admin
 */
router.put('/:id/assign-mentor',
  authenticateToken,
  requireRole(['can_committee', 'pastor', 'admin']),
  personIdValidation,
  assignMentorValidation,
  handleValidationErrors,
  PersonController.assignMentor
);

module.exports = router;