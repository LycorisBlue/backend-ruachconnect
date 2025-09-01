const { body } = require('express-validator');
const Constants = require('../utils/constants');

const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email requis')
    .isEmail()
    .withMessage('Format email invalide')
    .normalizeEmail(),
    
  body('password')
    .notEmpty()
    .withMessage('Mot de passe requis')
    .isLength({ min: 6 })
    .withMessage('Mot de passe minimum 6 caractères')
];

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

const updateProfileValidation = [
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
    
  body('churchSection')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Section église maximum 100 caractères')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Mot de passe actuel requis'),
    
  body('newPassword')
    .notEmpty()
    .withMessage('Nouveau mot de passe requis')
    .isLength({ min: 6 })
    .withMessage('Nouveau mot de passe minimum 6 caractères')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
      }
      return true;
    }),
    
  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirmation mot de passe requise')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('La confirmation ne correspond pas au nouveau mot de passe');
      }
      return true;
    })
];

module.exports = {
  loginValidation,
  createUserValidation,
  updateProfileValidation,
  changePasswordValidation
};