const express = require('express');
const router = express.Router();

const StatsController = require('../controllers/StatsController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { query } = require('express-validator');

// Validation pour dashboard stats
const dashboardStatsValidation = [
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Période invalide (week, month, quarter, year)'),
    
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Format start_date invalide (YYYY-MM-DD)'),
    
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Format end_date invalide (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.query.start_date) {
        const startDate = new Date(req.query.start_date);
        const endDate = new Date(value);
        
        if (endDate < startDate) {
          throw new Error('end_date doit être postérieure à start_date');
        }
      }
      return true;
    })
];

// Validation pour export
const exportValidation = [
  query('format')
    .optional()
    .isIn(['excel', 'csv'])
    .withMessage('Format invalide (excel, csv)'),
    
  query('type')
    .notEmpty()
    .withMessage('Type d\'export requis')
    .isIn(['persons', 'follow_ups', 'stats'])
    .withMessage('Type invalide (persons, follow_ups, stats)'),
    
  query('start_date')
    .optional()
    .isISO8601()
    .withMessage('Format start_date invalide (YYYY-MM-DD)'),
    
  query('end_date')
    .optional()
    .isISO8601()
    .withMessage('Format end_date invalide (YYYY-MM-DD)'),
    
  query('status')
    .optional()
    .isIn(['to_visit', 'in_follow_up', 'integrated', 'to_redirect', 'long_absent'])
    .withMessage('Statut invalide')
];

/**
 * @swagger
 * /stats/dashboard:
 *   get:
 *     tags: [Statistics]
 *     summary: Statistiques du tableau de bord
 *     description: Récupère les statistiques générales pour le tableau de bord administratif
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Période prédéfinie pour les statistiques
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début pour période personnalisée (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin pour période personnalisée (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
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
 *                         period:
 *                           type: string
 *                           example: "month"
 *                         startDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-01"
 *                         endDate:
 *                           type: string
 *                           format: date
 *                           example: "2024-01-31"
 *                         stats:
 *                           type: object
 *                           properties:
 *                             newVisitors:
 *                               type: integer
 *                               description: Nombre de nouveaux visiteurs
 *                               example: 25
 *                             totalPersons:
 *                               type: integer
 *                               description: Nombre total de personnes
 *                               example: 150
 *                             byStatus:
 *                               type: object
 *                               properties:
 *                                 to_visit:
 *                                   type: integer
 *                                   example: 8
 *                                 in_follow_up:
 *                                   type: integer
 *                                   example: 12
 *                                 integrated:
 *                                   type: integer
 *                                   example: 3
 *                                 to_redirect:
 *                                   type: integer
 *                                   example: 1
 *                                 long_absent:
 *                                   type: integer
 *                                   example: 1
 *                             byCommune:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   commune:
 *                                     type: string
 *                                     example: "Cocody"
 *                                   count:
 *                                     type: integer
 *                                     example: 8
 *                             byMentor:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   mentorName:
 *                                     type: string
 *                                     example: "Jean Dupont"
 *                                   assignedCount:
 *                                     type: integer
 *                                     example: 5
 *                                   integratedCount:
 *                                     type: integer
 *                                     example: 2
 *                             integrationRate:
 *                               type: number
 *                               format: float
 *                               description: Taux d'intégration en pourcentage
 *                               example: 72.5
 *                             activeMentors:
 *                               type: integer
 *                               description: Nombre de mentors actifs
 *                               example: 8
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/dashboard',
  authenticateToken,
  requireRole(['can_committee', 'pastor', 'admin']),
  dashboardStatsValidation,
  handleValidationErrors,
  StatsController.getDashboardStats
);

/**
 * @swagger
 * /stats/export:
 *   get:
 *     tags: [Statistics]
 *     summary: Export des données
 *     description: Génère un fichier d'export (Excel ou CSV) des données selon les filtres spécifiés
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [persons, follow_ups, stats]
 *         description: Type de données à exporter
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [excel, csv]
 *           default: excel
 *         description: Format d'export
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de début de la période (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date de fin de la période (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [to_visit, in_follow_up, integrated, to_redirect, long_absent]
 *         description: Filtrer par statut (pour type persons)
 *     responses:
 *       200:
 *         description: Fichier d'export généré avec succès
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
 *                         downloadUrl:
 *                           type: string
 *                           format: uri
 *                           description: URL de téléchargement du fichier
 *                           example: "https://api.ruachconnect.church/downloads/export_uuid.xlsx"
 *                         filename:
 *                           type: string
 *                           description: Nom du fichier généré
 *                           example: "export_nouveaux_janvier_2024.xlsx"
 *                         expiresAt:
 *                           type: string
 *                           format: date-time
 *                           description: Date d'expiration du lien de téléchargement
 *                           example: "2024-01-26T10:00:00.000Z"
 *                         fileSize:
 *                           type: integer
 *                           description: Taille du fichier en octets
 *                           example: 245760
 *             example:
 *               success: true
 *               message: "Export généré avec succès"
 *               data:
 *                 downloadUrl: "https://api.ruachconnect.church/downloads/export_abc123.xlsx"
 *                 filename: "export_visiteurs_janvier_2024.xlsx"
 *                 expiresAt: "2024-01-26T10:00:00.000Z"
 *                 fileSize: 245760
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.get('/export',
  authenticateToken,
  requireRole(['can_committee', 'pastor', 'admin']),
  exportValidation,
  handleValidationErrors,
  StatsController.exportData
);

module.exports = router;