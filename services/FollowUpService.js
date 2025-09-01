const database = require('../config/database');
const Constants = require('../utils/constants');
const Helpers = require('../utils/helpers');

class FollowUpService {
  /**
   * Création interaction de suivi
   */
  static async createFollowUp(followUpData, mentorId) {
    const prisma = database.getClient();
    
    const sanitizedData = Helpers.sanitizeUserInput(followUpData);
    
    const followUp = await prisma.followUp.create({
      data: {
        personId: sanitizedData.personId,
        mentorId: mentorId,
        interactionType: sanitizedData.interactionType,
        interactionDate: new Date(sanitizedData.interactionDate),
        notes: sanitizedData.notes,
        outcome: sanitizedData.outcome,
        nextActionNeeded: sanitizedData.nextActionNeeded || false,
        nextActionDate: sanitizedData.nextActionDate ? new Date(sanitizedData.nextActionDate) : null,
        nextActionNotes: sanitizedData.nextActionNotes
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            status: true
          }
        },
        mentor: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Auto-update du statut si c'est le premier suivi
    if (followUp.person.status === Constants.PERSON_STATUS.TO_VISIT) {
      await prisma.person.update({
        where: { id: followUpData.personId },
        data: { status: Constants.PERSON_STATUS.IN_FOLLOW_UP }
      });
    }

    return followUp;
  }

  /**
   * Liste des suivis avec filtres
   */
  static async getFollowUpsList(filters = {}, pagination = {}, userRole, userId) {
    const prisma = database.getClient();
    
    const { page, limit, skip, take } = Helpers.getPaginationParams(pagination.page, pagination.limit);
    
    // Construction filtres WHERE
    const where = {};
    
    if (filters.personId) {
      where.personId = filters.personId;
    }
    
    if (filters.mentorId) {
      where.mentorId = filters.mentorId;
    }
    
    // Mentors ne voient que leurs suivis
    if (userRole === Constants.USER_ROLES.MENTOR) {
      where.mentorId = userId;
    }
    
    if (filters.outcome) {
      where.outcome = filters.outcome;
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.interactionDate = {};
      if (filters.dateFrom) where.interactionDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.interactionDate.lte = new Date(filters.dateTo);
    }

    const [followUps, total] = await Promise.all([
      prisma.followUp.findMany({
        where,
        include: {
          person: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true
            }
          },
          mentor: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { interactionDate: 'desc' },
        skip,
        take
      }),
      prisma.followUp.count({ where })
    ]);

    return Helpers.formatPaginatedResponse(followUps, total, page, limit);
  }

  /**
   * Statistiques de suivi par mentor
   */
  static async getMentorFollowUpStats(mentorId, period = 'month') {
    const prisma = database.getClient();
    
    // Calcul période
    const now = new Date();
    let startDate;
    
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

    const [totalFollowUps, outcomeStats, typeStats] = await Promise.all([
      // Total suivis période
      prisma.followUp.count({
        where: {
          mentorId,
          interactionDate: { gte: startDate }
        }
      }),
      
      // Répartition par résultat
      prisma.followUp.groupBy({
        by: ['outcome'],
        where: {
          mentorId,
          interactionDate: { gte: startDate }
        },
        _count: { outcome: true }
      }),
      
      // Répartition par type
      prisma.followUp.groupBy({
        by: ['interactionType'],
        where: {
          mentorId,
          interactionDate: { gte: startDate }
        },
        _count: { interactionType: true }
      })
    ]);

    return {
      period,
      totalFollowUps,
      byOutcome: outcomeStats.reduce((acc, item) => {
        acc[item.outcome] = item._count.outcome;
        return acc;
      }, {}),
      byType: typeStats.reduce((acc, item) => {
        acc[item.interactionType] = item._count.interactionType;
        return acc;
      }, {})
    };
  }

  /**
   * Suivis en retard (pour rappels automatiques)
   */
  static async getOverdueFollowUps(daysTreshold = 7) {
    const prisma = database.getClient();
    
    const thresholdDate = new Date(Date.now() - daysTreshold * 24 * 60 * 60 * 1000);
    
    return await prisma.person.findMany({
      where: {
        status: {
          in: [Constants.PERSON_STATUS.TO_VISIT, Constants.PERSON_STATUS.IN_FOLLOW_UP]
        },
        assignedMentorId: { not: null },
        OR: [
          // Pas de suivi du tout
          { followUps: { none: {} } },
          // Dernier suivi trop ancien
          {
            followUps: {
              every: {
                interactionDate: { lt: thresholdDate }
              }
            }
          }
        ]
      },
      include: {
        assignedMentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        followUps: {
          orderBy: { interactionDate: 'desc' },
          take: 1,
          select: {
            interactionDate: true,
            outcome: true
          }
        }
      }
    });
  }

  /**
   * Prochaines actions programmées
   */
  static async getUpcomingActions(mentorId, daysAhead = 7) {
    const prisma = database.getClient();
    
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    
    return await prisma.followUp.findMany({
      where: {
        mentorId,
        nextActionNeeded: true,
        nextActionDate: {
          gte: new Date(),
          lte: endDate
        }
      },
      include: {
        person: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            status: true
          }
        }
      },
      orderBy: { nextActionDate: 'asc' }
    });
  }
}

module.exports = FollowUpService;