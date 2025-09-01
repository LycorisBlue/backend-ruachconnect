const ExportService = require('../services/ExportService');
const ApiResponse = require('../utils/apiResponse');
const Constants = require('../utils/constants');
const Helpers = require('../utils/helpers');

class StatsController {
  /**
   * GET /stats/dashboard - Statistiques tableau de bord
   */
  static async getDashboardStats(req, res) {
    try {
      const { period = 'month', start_date, end_date } = req.query;
      
      const database = require('../config/database');
      const prisma = database.getClient();
      
      // Calcul période
      let startDate, endDate;
      
      if (start_date && end_date) {
        startDate = new Date(start_date);
        endDate = new Date(end_date);
      } else {
        const now = new Date();
        switch (period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'quarter':
            startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
            break;
          case 'year':
            startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            break;
          default: // month
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        endDate = now;
      }

      // Requêtes parallèles pour performances
      const [
        newVisitors,
        totalPersons,
        statusStats,
        communeStats,
        mentorStats,
        activeMentors
      ] = await Promise.all([
        // Nouveaux visiteurs période
        prisma.person.count({
          where: {
            firstVisitDate: {
              gte: startDate,
              lte: endDate
            }
          }
        }),
        
        // Total personnes
        prisma.person.count(),
        
        // Répartition par statut
        prisma.person.groupBy({
          by: ['status'],
          _count: { status: true }
        }),
        
        // Répartition par commune (top 10)
        prisma.person.groupBy({
          by: ['commune'],
          where: { commune: { not: null } },
          _count: { commune: true },
          orderBy: { _count: { commune: 'desc' } },
          take: 10
        }),
        
        // Performance mentors
        prisma.user.findMany({
          where: {
            role: Constants.USER_ROLES.MENTOR,
            isActive: true
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            _count: {
              select: {
                assignedPersons: true,
                followUps: {
                  where: {
                    interactionDate: {
                      gte: startDate,
                      lte: endDate
                    }
                  }
                }
              }
            }
          }
        }),
        
        // Mentors actifs (ayant fait au moins un suivi)
        prisma.user.count({
          where: {
            role: Constants.USER_ROLES.MENTOR,
            isActive: true,
            followUps: {
              some: {
                interactionDate: {
                  gte: startDate,
                  lte: endDate
                }
              }
            }
          }
        })
      ]);

      // Calcul taux d'intégration
      const integratedCount = statusStats.find(s => s.status === Constants.PERSON_STATUS.INTEGRATED)?._count?.status || 0;
      const integrationRate = totalPersons > 0 ? ((integratedCount / totalPersons) * 100).toFixed(1) : 0;

      const stats = {
        period,
        start_date: Helpers.formatDate(startDate),
        end_date: Helpers.formatDate(endDate),
        stats: {
          new_visitors: newVisitors,
          total_persons: totalPersons,
          by_status: statusStats.reduce((acc, item) => {
            acc[item.status] = item._count.status;
            return acc;
          }, {}),
          by_commune: communeStats.map(item => ({
            commune: item.commune,
            count: item._count.commune
          })),
          by_mentor: mentorStats.map(mentor => ({
            mentor_name: `${mentor.firstName} ${mentor.lastName}`,
            assigned_count: mentor._count.assignedPersons,
            interactions_count: mentor._count.followUps
          })),
          integration_rate: parseFloat(integrationRate),
          active_mentors: activeMentors
        }
      };
      
      return ApiResponse.success(res, 'Statistiques récupérées', stats);
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      return ApiResponse.serverError(res, 'Erreur lors de la récupération des statistiques');
    }
  }

  /**
   * GET /stats/export - Export des données
   */
  static async exportData(req, res) {
    try {
      const { format = 'excel', type = 'persons', start_date, end_date, status } = req.query;
      
      const filters = {};
      if (start_date) filters.startDate = start_date;
      if (end_date) filters.endDate = end_date;
      if (status) filters.status = status;
      
      let exportResult;
      
      switch (type) {
        case 'persons':
          if (format === 'excel') {
            exportResult = await ExportService.exportPersonsToExcel(filters);
          } else {
            return ApiResponse.badRequest(res, 'Format CSV pour persons pas encore implémenté');
          }
          break;
          
        case 'follow_ups':
          if (format === 'excel') {
            exportResult = await ExportService.exportFollowUpsToExcel(filters);
          } else {
            return ApiResponse.badRequest(res, 'Format CSV pour follow_ups pas encore implémenté');
          }
          break;
          
        default:
          return ApiResponse.badRequest(res, 'Type d\'export invalide (persons, follow_ups)');
      }
      
      const downloadUrl = `${req.protocol}://${req.get('host')}/uploads/${exportResult.fileName}`;
      
      return ApiResponse.success(res, 'Export généré avec succès', {
        download_url: downloadUrl,
        filename: exportResult.fileName,
        records_count: exportResult.recordsCount,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
      });
    } catch (error) {
      console.error('Erreur export:', error);
      return ApiResponse.serverError(res, 'Erreur lors de l\'export');
    }
  }
}

module.exports = StatsController;