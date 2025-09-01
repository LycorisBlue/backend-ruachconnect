const PersonService = require('../services/PersonService');
const ApiResponse = require('../utils/apiResponse');
const Constants = require('../utils/constants');
const Helpers = require('../utils/helpers');

class PersonController {
  /**
   * POST /persons - Enregistrer nouveau visiteur
   */
  static async createPerson(req, res) {
    try {
      const personData = req.body;
      const createdBy = req.user.id;
      
      const person = await PersonService.createPerson(personData, createdBy);
      
      return ApiResponse.created(res, Constants.SUCCESS_MESSAGES.PERSON_CREATED, {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        status: person.status,
        assignedMentor: person.assignedMentor,
        createdAt: person.createdAt
      });
    } catch (error) {
      console.error('Erreur création personne:', error);
      return ApiResponse.serverError(res, 'Erreur lors de l\'enregistrement');
    }
  }

  /**
   * GET /persons - Liste des visiteurs avec filtres
   */
  static async getPersons(req, res) {
    try {
      const filters = {
        status: req.query.status,
        mentorId: req.query.mentor_id,
        search: req.query.search,
        commune: req.query.commune,
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to
      };

      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      // Filtres selon rôle utilisateur
      if (req.user.role === Constants.USER_ROLES.MENTOR) {
        filters.mentorId = req.user.id;
      }

      const result = await PersonService.getPersonsList(filters, pagination);
      
      return ApiResponse.success(res, 'Liste des visiteurs récupérée', result);
    } catch (error) {
      console.error('Erreur récupération liste:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }

  /**
   * GET /persons/:id - Détails d'un visiteur
   */
  static async getPersonById(req, res) {
    try {
      const { id } = req.params;
      
      if (!Helpers.isValidUUID(id)) {
        return ApiResponse.badRequest(res, 'ID invalide');
      }
      
      const person = await PersonService.getPersonById(id, req.user.role, req.user.id);
      
      return ApiResponse.success(res, 'Détails du visiteur récupérés', person);
    } catch (error) {
      console.error('Erreur récupération personne:', error);
      
      if (error.message.includes('non trouvée')) {
        return ApiResponse.notFound(res, 'Visiteur non trouvé');
      }
      
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }

  /**
   * PUT /persons/:id - Mise à jour visiteur
   */
  static async updatePerson(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (!Helpers.isValidUUID(id)) {
        return ApiResponse.badRequest(res, 'ID invalide');
      }

      const database = require('../config/database');
      const prisma = database.getClient();
      
      // Vérifier permissions
      if (req.user.role === Constants.USER_ROLES.MENTOR) {
        const person = await prisma.person.findUnique({
          where: { id },
          select: { assignedMentorId: true }
        });
        
        if (!person || person.assignedMentorId !== req.user.id) {
          return ApiResponse.forbidden(res, 'Vous ne pouvez modifier que vos visiteurs assignés');
        }
      }
      
      // Nettoyage données
      const sanitizedData = Helpers.sanitizeUserInput(updateData);
      
      const updatedPerson = await prisma.person.update({
        where: { id },
        data: {
          firstName: sanitizedData.firstName ? Helpers.capitalizeName(sanitizedData.firstName) : undefined,
          lastName: sanitizedData.lastName ? Helpers.capitalizeName(sanitizedData.lastName) : undefined,
          gender: sanitizedData.gender,
          dateOfBirth: sanitizedData.dateOfBirth ? new Date(sanitizedData.dateOfBirth) : undefined,
          phone: sanitizedData.phone ? Helpers.normalizePhone(sanitizedData.phone) : undefined,
          email: sanitizedData.email?.toLowerCase(),
          address: sanitizedData.address,
          commune: sanitizedData.commune,
          quartier: sanitizedData.quartier,
          profession: sanitizedData.profession,
          maritalStatus: sanitizedData.maritalStatus,
          howHeardAboutChurch: sanitizedData.howHeardAboutChurch,
          prayerRequests: sanitizedData.prayerRequests,
          updatedAt: new Date()
        },
        include: {
          assignedMentor: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      });
      
      return ApiResponse.success(res, Constants.SUCCESS_MESSAGES.PERSON_UPDATED, updatedPerson);
    } catch (error) {
      console.error('Erreur mise à jour personne:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la mise à jour');
    }
  }

  /**
   * PUT /persons/:id/status - Changement de statut
   */
  static async updatePersonStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      
      if (!Helpers.isValidUUID(id)) {
        return ApiResponse.badRequest(res, 'ID invalide');
      }
      
      const person = await PersonService.updatePersonStatus(id, status, notes, req.user.id);
      
      return ApiResponse.success(res, Constants.SUCCESS_MESSAGES.STATUS_UPDATED, {
        id: person.id,
        status: person.status,
        updatedAt: person.updatedAt
      });
    } catch (error) {
      console.error('Erreur changement statut:', error);
      return ApiResponse.serverError(res, 'Erreur lors du changement de statut');
    }
  }

  /**
   * PUT /persons/:id/assign-mentor - Attribution/réassignation mentor
   */
  static async assignMentor(req, res) {
    try {
      const { id } = req.params;
      const { mentorId, notes } = req.body;
      
      if (!Helpers.isValidUUID(id) || !Helpers.isValidUUID(mentorId)) {
        return ApiResponse.badRequest(res, 'ID invalide');
      }
      
      const person = await PersonService.assignMentor(id, mentorId, notes, req.user.id);
      
      return ApiResponse.success(res, Constants.SUCCESS_MESSAGES.MENTOR_ASSIGNED, {
        personId: person.id,
        assignedMentor: person.assignedMentor,
        assignedAt: person.updatedAt
      });
    } catch (error) {
      console.error('Erreur attribution mentor:', error);
      return ApiResponse.serverError(res, 'Erreur lors de l\'attribution');
    }
  }
}

module.exports = PersonController;