const { body, param, query } = require('express-validator');
const Constants = require('../utils/constants');

const createPersonValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Prénom requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Prénom entre 2 et 100 caractères'),
    
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Nom requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nom entre 2 et 100 caractères'),
    
  body('gender')
    .notEmpty()
    .withMessage('Genre requis')
    .isIn(Object.values(Constants.GENDERS))
    .withMessage('Genre doit être M ou F'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Format date de naissance invalide (YYYY-MM-DD)')
    .custom((value) => {
      if (value) {
        const birthDate = new Date(value);
        const now = new Date();
        const age = (now - birthDate) / (365.25 * 24 * 60 * 60 * 1000);
        
        if (age < 0 || age > 120) {
          throw new Error('Date de naissance doit être réaliste');
        }
      }
      return true;
    }),
    
  body('phone')
    .optional()
    .matches(/^[\d\s\+\-\(\)\.]+$/)
    .withMessage('Format téléphone invalide'),
    
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Format email invalide')
    .normalizeEmail(),
    
  body('commune')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Commune maximum 100 caractères'),
    
  body('quartier')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Quartier maximum 100 caractères'),
    
  body('profession')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Profession maximum 100 caractères'),
    
  body('maritalStatus')
    .optional()
    .isIn(Object.values(Constants.MARITAL_STATUS))
    .withMessage('Statut marital invalide'),
    
  body('firstVisitDate')
    .notEmpty()
    .withMessage('Date de première visite requise')
    .isISO8601()
    .withMessage('Format date invalide (YYYY-MM-DD)')
    .custom((value) => {
      const visitDate = new Date(value);
      const now = new Date();
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      
      if (visitDate > now) {
        throw new Error('La date de visite ne peut pas être dans le futur');
      }
      
      if (visitDate < oneYearAgo) {
        throw new Error('La date de visite ne peut pas être antérieure à un an');
      }
      
      return true;
    }),
    
  body('howHeardAboutChurch')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Réponse maximum 500 caractères'),
    
  body('prayerRequests')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Demandes de prière maximum 1000 caractères')
];

const updatePersonValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Prénom entre 2 et 100 caractères'),
    
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nom entre 2 et 100 caractères'),
    
  body('gender')
    .optional()
    .isIn(Object.values(Constants.GENDERS))
    .withMessage('Genre doit être M ou F'),
    
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Format date de naissance invalide'),
    
  body('phone')
    .optional()
    .matches(/^[\d\s\+\-\(\)\.]+$/)
    .withMessage('Format téléphone invalide'),
    
  body('email')
    .optional({ nullable: true, checkFalsy: true })
    .isEmail()
    .withMessage('Format email invalide')
    .normalizeEmail(),
    
  body('maritalStatus')
    .optional()
    .isIn(Object.values(Constants.MARITAL_STATUS))
    .withMessage('Statut marital invalide')
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Statut requis')
    .isIn(Object.values(Constants.PERSON_STATUS))
    .withMessage('Statut invalide'),
    
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes maximum 500 caractères')
];

const assignMentorValidation = [
  body('mentorId')
    .notEmpty()
    .withMessage('ID mentor requis')
    .isUUID(4)
    .withMessage('ID mentor invalide'),
    
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes maximum 500 caractères')
];

const personIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID requis')
    .isUUID(4)
    .withMessage('ID invalide')
];

const getPersonsQueryValidation = [
  query('status')
    .optional()
    .isIn(Object.values(Constants.PERSON_STATUS))
    .withMessage('Statut invalide'),
    
  query('mentor_id')
    .optional()
    .isUUID(4)
    .withMessage('ID mentor invalide'),
    
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page doit être un entier positif'),
    
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite entre 1 et 100'),
    
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
    })
];

module.exports = {
  createPersonValidation,
  updatePersonValidation,
  updateStatusValidation,
  assignMentorValidation,
  personIdValidation,
  getPersonsQueryValidation
};