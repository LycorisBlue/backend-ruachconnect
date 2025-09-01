const AuthService = require('../services/AuthService');
const ApiResponse = require('../utils/apiResponse');
const Constants = require('../utils/constants');
const Helpers = require('../utils/helpers');

class UserController {
  /**
   * GET /users - Liste des utilisateurs
   */
  static async getUsers(req, res) {
    try {
      const filters = {
        role: req.query.role,
        isActive: req.query.is_active,
        churchSection: req.query.church_section
      };

      const database = require('../config/database');
      const prisma = database.getClient();
      
      const where = {};
      
      if (filters.role) {
        where.role = filters.role;
      }
      
      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive === 'true';
      }
      
      if (filters.churchSection) {
        where.churchSection = { contains: filters.churchSection };
      }

      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
          churchSection: true,
          isActive: true,
          createdAt: true,
          _count: {
            select: {
              assignedPersons: {
                where: {
                  status: {
                    in: [Constants.PERSON_STATUS.TO_VISIT, Constants.PERSON_STATUS.IN_FOLLOW_UP]
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { role: 'asc' },
          { lastName: 'asc' }
        ]
      });

      const usersWithCount = users.map(user => ({
        ...user,
        assignedPersonsCount: user._count.assignedPersons
      }));

      return ApiResponse.success(res, 'Liste des utilisateurs récupérée', {
        users: usersWithCount
      });
    } catch (error) {
      console.error('Erreur récupération utilisateurs:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }

  /**
   * POST /users - Création nouvel utilisateur (admin seulement)
   */
  static async createUser(req, res) {
    try {
      const userData = req.body;
      
      // Générer mot de passe temporaire si non fourni
      if (!userData.password) {
        userData.password = AuthService.generateTemporaryPassword();
      }
      
      const user = await AuthService.createUser(userData);
      
      return ApiResponse.created(res, Constants.SUCCESS_MESSAGES.USER_CREATED, {
        ...user,
        temporaryPassword: userData.password !== req.body.password ? userData.password : undefined
      });
    } catch (error) {
      console.error('Erreur création utilisateur:', error);
      
      if (error.code === 'P2002') {
        return ApiResponse.badRequest(res, 'Cette adresse email est déjà utilisée');
      }
      
      return ApiResponse.serverError(res, 'Erreur lors de la création');
    }
  }

  /**
   * PUT /users/:id - Mise à jour utilisateur
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!Helpers.isValidUUID(id)) {
        return ApiResponse.badRequest(res, 'ID invalide');
      }

      const database = require('../config/database');
      const prisma = database.getClient();
      
      const sanitizedData = Helpers.sanitizeUserInput(updateData);
      
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          firstName: sanitizedData.firstName,
          lastName: sanitizedData.lastName,
          phone: sanitizedData.phone,
          role: sanitizedData.role,
          churchSection: sanitizedData.churchSection,
          isActive: sanitizedData.isActive,
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
          isActive: true,
          updatedAt: true
        }
      });
      
      return ApiResponse.success(res, 'Utilisateur mis à jour', updatedUser);
    } catch (error) {
      console.error('Erreur mise à jour utilisateur:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la mise à jour');
    }
  }

  /**
   * DELETE /users/:id - Désactivation utilisateur (soft delete)
   */
  static async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      
      if (!Helpers.isValidUUID(id)) {
        return ApiResponse.badRequest(res, 'ID invalide');
      }

      const database = require('../config/database');
      const prisma = database.getClient();
      
      const user = await prisma.user.update({
        where: { id },
        data: { isActive: false },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          isActive: true
        }
      });
      
      return ApiResponse.success(res, 'Utilisateur désactivé', user);
    } catch (error) {
      console.error('Erreur désactivation utilisateur:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la désactivation');
    }
  }

  /**
   * GET /users/mentors - Liste des mentors disponibles
   */
  static async getAvailableMentors(req, res) {
    try {
      const database = require('../config/database');
      const prisma = database.getClient();
      
      const mentors = await prisma.user.findMany({
        where: {
          role: Constants.USER_ROLES.MENTOR,
          isActive: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          churchSection: true,
          _count: {
            select: {
              assignedPersons: {
                where: {
                  status: {
                    in: [Constants.PERSON_STATUS.TO_VISIT, Constants.PERSON_STATUS.IN_FOLLOW_UP]
                  }
                }
              }
            }
          }
        },
        orderBy: [
          { churchSection: 'asc' },
          { lastName: 'asc' }
        ]
      });

      const mentorsWithLoad = mentors.map(mentor => ({
        ...mentor,
        currentLoad: mentor._count.assignedPersons,
        isAvailable: mentor._count.assignedPersons < Constants.DEFAULT_SETTINGS.MAX_PERSONS_PER_MENTOR
      }));
      
      return ApiResponse.success(res, 'Liste des mentors récupérée', {
        mentors: mentorsWithLoad
      });
    } catch (error) {
      console.error('Erreur récupération mentors:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }
}

module.exports = UserController;