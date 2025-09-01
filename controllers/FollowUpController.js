const FollowUpService = require('../services/FollowUpService');
const ApiResponse = require('../utils/apiResponse');
const Constants = require('../utils/constants');
const Helpers = require('../utils/helpers');

class FollowUpController {
  /**
   * POST /follow-ups - Enregistrer interaction de suivi
   */
  static async createFollowUp(req, res) {
    try {
      const followUpData = req.body;
      const mentorId = req.user.id;
      
      // Vérifier que le mentor peut créer un suivi pour cette personne
      if (req.user.role === Constants.USER_ROLES.MENTOR) {
        const database = require('../config/database');
        const prisma = database.getClient();
        
        const person = await prisma.person.findUnique({
          where: { id: followUpData.personId },
          select: { assignedMentorId: true }
        });
        
        if (!person || person.assignedMentorId !== mentorId) {
          return ApiResponse.forbidden(res, 'Vous ne pouvez créer un suivi que pour vos visiteurs assignés');
        }
      }
      
      const followUp = await FollowUpService.createFollowUp(followUpData, mentorId);
      
      return ApiResponse.created(res, Constants.SUCCESS_MESSAGES.FOLLOW_UP_CREATED, {
        id: followUp.id,
        personId: followUp.personId,
        mentorId: followUp.mentorId,
        interactionType: followUp.interactionType,
        interactionDate: followUp.interactionDate,
        outcome: followUp.outcome,
        createdAt: followUp.createdAt
      });
    } catch (error) {
      console.error('Erreur création suivi:', error);
      return ApiResponse.serverError(res, 'Erreur lors de l\'enregistrement du suivi');
    }
  }

  /**
   * GET /follow-ups - Liste des suivis avec filtres
   */
  static async getFollowUps(req, res) {
    try {
      const filters = {
        personId: req.query.person_id,
        mentorId: req.query.mentor_id,
        outcome: req.query.outcome,
        dateFrom: req.query.date_from,
        dateTo: req.query.date_to
      };

      const pagination = {
        page: req.query.page,
        limit: req.query.limit
      };

      const result = await FollowUpService.getFollowUpsList(
        filters, 
        pagination, 
        req.user.role, 
        req.user.id
      );
      
      return ApiResponse.success(res, 'Historique des suivis récupéré', result);
    } catch (error) {
      console.error('Erreur récupération suivis:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }

  /**
   * GET /follow-ups/stats - Statistiques de suivi
   */
  static async getFollowUpStats(req, res) {
    try {
      const { period = 'month' } = req.query;
      let mentorId = req.query.mentor_id;
      
      // Les mentors ne voient que leurs propres stats
      if (req.user.role === Constants.USER_ROLES.MENTOR) {
        mentorId = req.user.id;
      }
      
      if (!mentorId) {
        return ApiResponse.badRequest(res, 'ID mentor requis');
      }
      
      const stats = await FollowUpService.getMentorFollowUpStats(mentorId, period);
      
      return ApiResponse.success(res, 'Statistiques de suivi récupérées', stats);
    } catch (error) {
      console.error('Erreur statistiques suivi:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * GET /follow-ups/overdue - Suivis en retard
   */
  static async getOverdueFollowUps(req, res) {
    try {
      const { days = 7 } = req.query;
      
      const overdueFollowUps = await FollowUpService.getOverdueFollowUps(parseInt(days));
      
      // Filtrer selon rôle
      let filteredData = overdueFollowUps;
      if (req.user.role === Constants.USER_ROLES.MENTOR) {
        filteredData = overdueFollowUps.filter(person => 
          person.assignedMentor?.id === req.user.id
        );
      }
      
      return ApiResponse.success(res, 'Suivis en retard récupérés', {
        overdueCount: filteredData.length,
        persons: filteredData
      });
    } catch (error) {
      console.error('Erreur récupération suivis en retard:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }

  /**
   * GET /follow-ups/upcoming-actions - Prochaines actions programmées
   */
  static async getUpcomingActions(req, res) {
    try {
      const { days = 7 } = req.query;
      let mentorId = req.query.mentor_id;
      
      // Les mentors ne voient que leurs actions
      if (req.user.role === Constants.USER_ROLES.MENTOR) {
        mentorId = req.user.id;
      }
      
      if (!mentorId) {
        return ApiResponse.badRequest(res, 'ID mentor requis');
      }
      
      const upcomingActions = await FollowUpService.getUpcomingActions(mentorId, parseInt(days));
      
      return ApiResponse.success(res, 'Prochaines actions récupérées', {
        actionsCount: upcomingActions.length,
        actions: upcomingActions
      });
    } catch (error) {
      console.error('Erreur récupération actions:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération');
    }
  }
}

module.exports = FollowUpController;