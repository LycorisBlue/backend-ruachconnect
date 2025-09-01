const { body, param, query } = require('express-validator');
const Constants = require('../utils/constants');

const createFollowUpValidation = [
  body('personId')
    .notEmpty()
    .withMessage('ID personne requis')
    .isUUID(4)
    .withMessage('ID personne invalide'),
    
  body('interactionType')
    .notEmpty()
    .withMessage('Type d\'interaction requis')
    .isIn(Object.values(Constants.INTERACTION_TYPES))
    .withMessage('Type d\'interaction invalide'),
    
  body('interactionDate')
    .notEmpty()
    .withMessage('Date d\'interaction requise')
    .isISO8601()
    .withMessage('Format date invalide (YYYY-MM-DD)')
    .custom((value) => {
      const interactionDate = new Date(value);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      
      if (interactionDate > now) {
        throw new Error('La date d\'interaction ne peut pas être dans le futur');
      }
      
      if (interactionDate < oneYearAgo) {
        throw new Error('La date d\'interaction ne peut pas être antérieure à un an');
      }
      
      return true;
    }),
    
  body('outcome')
    .notEmpty()
    .withMessage('Résultat de l\'interaction requis')
    .isIn(Object.values(Constants.OUTCOMES))
    .withMessage('Résultat invalide'),
    
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes maximum 1000 caractères'),
    
  body('nextActionNeeded')
    .optional()
    .isBoolean()
    .withMessage('nextActionNeeded doit être un booléen'),
    
  body('nextActionDate')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Format date action invalide (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value) {
        const actionDate = new Date(value);
        const interactionDate = new Date(req.body.interactionDate);
        
        if (actionDate <= interactionDate) {
          throw new Error('La date d\'action suivante doit être postérieure à la date d\'interaction');
        }
        
        const maxFutureDate = new Date();
        maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1);
        
        if (actionDate > maxFutureDate) {
          throw new Error('La date d\'action ne peut pas être dans plus d\'un an');
        }
      }
      return true;
    }),
    
  body('nextActionNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes action maximum 500 caractères')
];

const getFollowUpsQueryValidation = [
  query('person_id')
    .optional()
    .isUUID(4)
    .withMessage('ID personne invalide'),
    
  query('mentor_id')
    .optional()
    .isUUID(4)
    .withMessage('ID mentor invalide'),
    
  query('outcome')
    .optional()
    .isIn(Object.values(Constants.OUTCOMES))
    .withMessage('Résultat invalide'),
    
  query('date_from')
    .optional()
    .isISO8601()
    .withMessage('Format date_from invalide (YYYY-MM-DD)'),
    
  query('date_to')
    .optional()
    .isISO8601()
    .withMessage('Format date_to invalide (YYYY-MM-DD)')
    .custom((value, { req }) => {
      if (value && req.query.date_from) {
        const dateFrom = new Date(req.query.date_from);
        const dateTo = new Date(value);
        
        if (dateTo < dateFrom) {
          throw new Error('date_to doit être postérieure à date_from');
        }
      }
      return true;
    }),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page doit être un entier positif'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite entre 1 et 100')
];

const followUpStatsValidation = [
  query('mentor_id')
    .optional()
    .isUUID(4)
    .withMessage('ID mentor invalide'),
    
  query('period')
    .optional()
    .isIn(['week', 'month', 'quarter', 'year'])
    .withMessage('Période invalide (week, month, quarter, year)')
];

const overdueQueryValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Nombre de jours entre 1 et 365')
];

const upcomingActionsValidation = [
  query('mentor_id')
    .optional()
    .isUUID(4)
    .withMessage('ID mentor invalide'),
    
  query('days')
    .optional()
    .isInt({ min: 1, max: 90 })
    .withMessage('Nombre de jours entre 1 et 90')
];

module.exports = {
  createFollowUpValidation,
  getFollowUpsQueryValidation,
  followUpStatsValidation,
  overdueQueryValidation,
  upcomingActionsValidation
};