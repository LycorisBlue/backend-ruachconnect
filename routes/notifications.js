const express = require('express');
const router = express.Router();

const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { query, param } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');
const Constants = require('../utils/constants');
const Helpers = require('../utils/helpers');

// Validation pour liste notifications
const getNotificationsValidation = [
  query('is_read')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_read doit être true ou false'),
    
  query('type')
    .optional()
    .isIn(Object.values(Constants.NOTIFICATION_TYPES))
    .withMessage('Type de notification invalide'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page doit être un entier positif'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite entre 1 et 50')
];

// Validation pour marquer comme lu
const markAsReadValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID notification requis')
    .isUUID(4)
    .withMessage('ID notification invalide')
];

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notifications]
 *     summary: Liste des notifications utilisateur
 *     description: Récupère les notifications de l'utilisateur connecté avec options de filtrage
 *     parameters:
 *       - in: query
 *         name: is_read
 *         schema:
 *           type: string
 *           enum: ['true', 'false']
 *         description: Filtrer par statut lu/non lu
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [new_assignment, follow_up_reminder, overdue_visit, status_change]
 *         description: Filtrer par type de notification
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
 *           maximum: 50
 *           default: 20
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Notifications récupérées avec succès
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
 *                         notifications:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Notification'
 *                         unreadCount:
 *                           type: integer
 *                           description: Nombre total de notifications non lues
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
 *               message: "Notifications récupérées avec succès"
 *               data:
 *                 notifications:
 *                   - id: "11111111-1111-1111-1111-111111111111"
 *                     type: "follow_up_reminder"
 *                     title: "Suivi en attente"
 *                     message: "Marie Kouassi attend un suivi depuis 5 jours"
 *                     isRead: false
 *                     actionUrl: "/persons/12345678-1234-1234-1234-123456789012"
 *                     createdAt: "2024-01-25T09:00:00.000Z"
 *                 unreadCount: 3
 *                 pagination:
 *                   currentPage: 1
 *                   totalPages: 1
 *                   totalItems: 5
 *                   perPage: 20
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/',
  authenticateToken,
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  getNotificationsValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const filters = {
        isRead: req.query.is_read,
        type: req.query.type,
        page: req.query.page,
        limit: req.query.limit
      };
      
      const PersonService = require('../services/PersonService');
      const result = await PersonService.getUserNotifications(req.user.id, filters);
      
      return ApiResponse.success(res, 'Notifications récupérées', result);
    } catch (error) {
      console.error('Erreur récupération notifications:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }
);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     tags: [Notifications]
 *     summary: Marquer une notification comme lue
 *     description: Met à jour le statut d'une notification pour la marquer comme lue
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID unique de la notification
 *     responses:
 *       200:
 *         description: Notification marquée comme lue avec succès
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
 *                         is_read:
 *                           type: boolean
 *                           example: true
 *                         read_at:
 *                           type: string
 *                           format: date-time
 *                           example: "2024-01-25T16:30:00.000Z"
 *             example:
 *               success: true
 *               message: "Notification marquée comme lue"
 *               data:
 *                 id: "11111111-1111-1111-1111-111111111111"
 *                 is_read: true
 *                 read_at: "2024-01-25T16:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.put('/:id/read',
  authenticateToken,
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  markAsReadValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      const PersonService = require('../services/PersonService');
      const notification = await PersonService.markNotificationAsRead(id, req.user.id);
      
      return ApiResponse.success(res, 'Notification marquée comme lue', {
        id: notification.id,
        is_read: notification.isRead,
        read_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur marquage notification:', error);
      
      if (error.code === 'P2025') {
        return ApiResponse.notFound(res, 'Notification non trouvée');
      }
      
      return ApiResponse.serverError(res, 'Erreur lors du marquage');
    }
  }
);

/**
 * @swagger
 * /notifications/unread-count:
 *   get:
 *     tags: [Notifications]
 *     summary: Nombre de notifications non lues
 *     description: Retourne le nombre total de notifications non lues pour l'utilisateur connecté
 *     responses:
 *       200:
 *         description: Compteur de notifications récupéré avec succès
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
 *                         unread_count:
 *                           type: integer
 *                           description: Nombre de notifications non lues
 *                           example: 3
 *             example:
 *               success: true
 *               message: "Compteur récupéré avec succès"
 *               data:
 *                 unread_count: 3
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/unread-count',
  authenticateToken,
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  async (req, res) => {
    try {
      const database = require('../config/database');
      const prisma = database.getClient();
      
      const unreadCount = await prisma.notification.count({
        where: {
          userId: req.user.id,
          isRead: false
        }
      });
      
      return ApiResponse.success(res, 'Compteur récupéré', {
        unread_count: unreadCount
      });
    } catch (error) {
      console.error('Erreur compteur notifications:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }
);

module.exports = router;