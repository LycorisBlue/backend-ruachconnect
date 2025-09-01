const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadLimiter } = require('../middleware/rateLimiter');
const { handleValidationErrors } = require('../middleware/validation');
const { body } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');
const Constants = require('../utils/constants');
const config = require('../config/app');

// Configuration Multer
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = config.upload.allowedTypes;
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.maxSize
  },
  fileFilter
});

// Validation pour upload photo
const uploadPhotoValidation = [
  body('person_id')
    .notEmpty()
    .withMessage('ID personne requis')
    .isUUID(4)
    .withMessage('ID personne invalide')
];

/**
 * @swagger
 * /upload/photo:
 *   post:
 *     tags: [Upload]
 *     summary: Upload d'une photo de visiteur
 *     description: Téléverse et associe une photo de profil à un visiteur. L'image est automatiquement redimensionnée et optimisée.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - person_id
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPG, JPEG, PNG max 5MB)
 *               person_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID du visiteur pour lequel uploader la photo
 *           example:
 *             person_id: "12345678-1234-1234-1234-123456789012"
 *     responses:
 *       200:
 *         description: Photo uploadée avec succès
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
 *                         photo_url:
 *                           type: string
 *                           format: uri
 *                           description: URL publique de la photo uploadée
 *                           example: "https://api.ruachconnect.church/uploads/abc123.jpg"
 *                         file_size:
 *                           type: integer
 *                           description: Taille du fichier original en octets
 *                           example: 245760
 *                         uploaded_at:
 *                           type: string
 *                           format: date-time
 *                           description: Date et heure d'upload
 *                           example: "2024-01-25T16:45:00.000Z"
 *             example:
 *               success: true
 *               message: "Photo uploadée avec succès"
 *               data:
 *                 photo_url: "https://api.ruachconnect.church/uploads/abc123.jpg"
 *                 file_size: 245760
 *                 uploaded_at: "2024-01-25T16:45:00.000Z"
 *       400:
 *         description: Erreur de validation ou fichier manquant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             examples:
 *               no_file:
 *                 summary: Aucun fichier fourni
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "BAD_REQUEST"
 *                     message: "Aucun fichier fourni"
 *               invalid_type:
 *                 summary: Type de fichier non autorisé
 *                 value:
 *                   success: false
 *                   error:
 *                     code: "BAD_REQUEST"
 *                     message: "Type de fichier non autorisé. Types acceptés: jpg, jpeg, png"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         description: Permissions insuffisantes ou visiteur non assigné
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "FORBIDDEN"
 *                 message: "Vous ne pouvez uploader une photo que pour vos visiteurs assignés"
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
 *       413:
 *         description: Fichier trop volumineux
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "FILE_TOO_LARGE"
 *                 message: "Fichier trop volumineux (max 5MB)"
 *       429:
 *         description: Trop d'uploads
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "TOO_MANY_REQUESTS"
 *                 message: "Trop d'uploads. Réessayez dans 1 heure."
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
router.post('/photo',
  uploadLimiter,
  authenticateToken,
  requireRole(['can_committee', 'mentor', 'pastor', 'admin']),
  upload.single('file'),
  uploadPhotoValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      if (!req.file) {
        return ApiResponse.badRequest(res, 'Aucun fichier fourni');
      }

      const { person_id } = req.body;
      
      // Vérifier que la personne existe et permissions
      const database = require('../config/database');
      const prisma = database.getClient();
      
      const person = await prisma.person.findUnique({
        where: { id: person_id },
        select: { 
          id: true, 
          assignedMentorId: true,
          firstName: true,
          lastName: true 
        }
      });
      
      if (!person) {
        return ApiResponse.notFound(res, 'Visiteur non trouvé');
      }
      
      // Vérifier permissions mentor
      if (req.user.role === Constants.USER_ROLES.MENTOR && 
          person.assignedMentorId !== req.user.id) {
        return ApiResponse.forbidden(res, 'Vous ne pouvez uploader une photo que pour vos visiteurs assignés');
      }
      
      // Générer nom de fichier unique
      const fileExtension = path.extname(req.file.originalname).toLowerCase();
      const fileName = `${uuidv4()}${fileExtension}`;
      const filePath = path.join(config.upload.path, fileName);
      
      // Redimensionner et optimiser l'image
      await sharp(req.file.buffer)
        .resize(Constants.UPLOAD.PHOTO_MAX_WIDTH, Constants.UPLOAD.PHOTO_MAX_HEIGHT, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(filePath);
      
      // URL publique de la photo
      const photoUrl = `${config.upload.url}/${fileName}`;
      
      // Mettre à jour la personne avec l'URL de la photo
      await prisma.person.update({
        where: { id: person_id },
        data: { photoUrl }
      });
      
      return ApiResponse.success(res, Constants.SUCCESS_MESSAGES.PHOTO_UPLOADED, {
        photo_url: photoUrl,
        file_size: req.file.size,
        uploaded_at: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Erreur upload photo:', error);
      
      if (error.code === 'ENOENT') {
        return ApiResponse.serverError(res, 'Erreur de stockage fichier');
      }
      
      return ApiResponse.serverError(res, 'Erreur lors de l\'upload');
    }
  }
);

/**
 * @swagger
 * /upload/photo/{personId}:
 *   delete:
 *     tags: [Upload]
 *     summary: Supprimer la photo d'un visiteur
 *     description: Supprime la photo de profil d'un visiteur du serveur et met à jour la base de données
 *     parameters:
 *       - in: path
 *         name: personId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID unique du visiteur
 *         example: "12345678-1234-1234-1234-123456789012"
 *     responses:
 *       200:
 *         description: Photo supprimée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Photo supprimée avec succès"
 *       400:
 *         description: ID visiteur invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *             example:
 *               success: false
 *               error:
 *                 code: "BAD_REQUEST"
 *                 message: "ID personne invalide"
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
router.delete('/photo/:personId',
  authenticateToken,
  requireRole(['can_committee', 'pastor', 'admin']),
  async (req, res) => {
    try {
      const { personId } = req.params;
      
      if (!require('../utils/helpers').isValidUUID(personId)) {
        return ApiResponse.badRequest(res, 'ID personne invalide');
      }
      
      const database = require('../config/database');
      const prisma = database.getClient();
      
      const person = await prisma.person.findUnique({
        where: { id: personId },
        select: { photoUrl: true }
      });
      
      if (!person) {
        return ApiResponse.notFound(res, 'Visiteur non trouvé');
      }
      
      // Supprimer le fichier physique si existe
      if (person.photoUrl) {
        const fileName = path.basename(person.photoUrl);
        const filePath = path.join(config.upload.path, fileName);
        
        try {
          const fs = require('fs');
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } catch (fileError) {
          console.warn('Erreur suppression fichier physique:', fileError);
        }
      }
      
      // Mettre à jour la base de données
      await prisma.person.update({
        where: { id: personId },
        data: { photoUrl: null }
      });
      
      return ApiResponse.success(res, 'Photo supprimée avec succès');
      
    } catch (error) {
      console.error('Erreur suppression photo:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la suppression');
    }
  }
);

module.exports = router;