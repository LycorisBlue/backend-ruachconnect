const { body, param, query } = require('express-validator');
const Constants = require('../utils/constants');

const createUserValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email requis')
    .isEmail()
    .withMessage('Format email invalide')
    .normalizeEmail(),
    
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
    
  body('role')
    .notEmpty()
    .withMessage('Rôle requis')
    .isIn(Object.values(Constants.USER_ROLES))
    .withMessage('Rôle invalide'),
    
  body('phone')
    .optional()
    .matches(/^[\d\s\+\-\(\)\.]+$/)
    .withMessage('Format téléphone invalide'),
    
  body('churchSection')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Section église maximum 100 caractères'),
    
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Mot de passe minimum 6 caractères')
];

const updateUserValidation = [
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
    
  body('phone')
    .optional()
    .matches(/^[\d\s\+\-\(\)\.]+$/)
    .withMessage('Format téléphone invalide'),
    
  body('role')
    .optional()
    .isIn(Object.values(Constants.USER_ROLES))
    .withMessage('Rôle invalide'),
    
  body('churchSection')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Section église maximum 100 caractères'),
    
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive doit être un booléen')
];

const userIdValidation = [
  param('id')
    .notEmpty()
    .withMessage('ID utilisateur requis')
    .isUUID(4)
    .withMessage('ID utilisateur invalide')
];

const getUsersQueryValidation = [
  query('role')
    .optional()
    .isIn(Object.values(Constants.USER_ROLES))
    .withMessage('Rôle invalide'),
    
  query('is_active')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('is_active doit être true ou false'),
    
  query('church_section')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Section église maximum 100 caractères')
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  userIdValidation,
  getUsersQueryValidation
};