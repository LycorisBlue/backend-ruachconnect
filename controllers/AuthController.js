const AuthService = require('../services/AuthService');
const ApiResponse = require('../utils/apiResponse');
const Constants = require('../utils/constants');

class AuthController {
  /**
   * POST /auth/login - Connexion utilisateur
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      
      const result = await AuthService.login(email, password);
      
      return ApiResponse.success(res, Constants.SUCCESS_MESSAGES.LOGIN_SUCCESS, result);
    } catch (error) {
      console.error('Erreur connexion:', error);
      
      if (error.message.includes('non trouvé') || error.message.includes('incorrect')) {
        return ApiResponse.unauthorized(res, 'Email ou mot de passe incorrect');
      }
      
      return ApiResponse.serverError(res, 'Erreur lors de la connexion');
    }
  }

  /**
   * POST /auth/logout - Déconnexion
   */
  static async logout(req, res) {
    try {
      // Dans une implémentation complète, on pourrait blacklister le token
      // Pour l'instant, la déconnexion est gérée côté client
      
      return ApiResponse.success(res, Constants.SUCCESS_MESSAGES.LOGOUT_SUCCESS);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la déconnexion');
    }
  }

  /**
   * GET /auth/me - Profil utilisateur connecté
   */
  static async getProfile(req, res) {
    try {
      const user = await AuthService.getUserById(req.user.id);
      
      if (!user) {
        return ApiResponse.notFound(res, 'Utilisateur non trouvé');
      }
      
      return ApiResponse.success(res, 'Profil récupéré', user);
    } catch (error) {
      console.error('Erreur récupération profil:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération du profil');
    }
  }

  /**
   * PUT /auth/profile - Mise à jour profil
   */
  static async updateProfile(req, res) {
    try {
      const { firstName, lastName, phone, churchSection } = req.body;
      const userId = req.user.id;
      
      const database = require('../config/database');
      const prisma = database.getClient();
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phone,
          churchSection,
          updatedAt: new Date()
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          churchSection: true,
          updatedAt: true
        }
      });
      
      return ApiResponse.success(res, 'Profil mis à jour', updatedUser);
    } catch (error) {
      console.error('Erreur mise à jour profil:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la mise à jour');
    }
  }

  /**
   * POST /auth/change-password - Changement mot de passe
   */
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user.id;
      
      const database = require('../config/database');
      const prisma = database.getClient();
      
      // Vérifier ancien mot de passe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { passwordHash: true }
      });
      
      const isCurrentPasswordValid = await AuthService.verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return ApiResponse.badRequest(res, 'Mot de passe actuel incorrect');
      }
      
      // Hash nouveau mot de passe
      const newPasswordHash = await AuthService.hashPassword(newPassword);
      
      // Mettre à jour
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash }
      });
      
      return ApiResponse.success(res, 'Mot de passe mis à jour');
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      return ApiResponse.serverError(res, 'Erreur lors du changement de mot de passe');
    }
  }
}

module.exports = AuthController;