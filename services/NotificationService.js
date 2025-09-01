const database = require('../config/database');
const Constants = require('../utils/constants');

class NotificationService {
  /**
   * Création notification d'assignment
   */
  static async createAssignmentNotification(mentorId, personId) {
    const prisma = database.getClient();
    
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { firstName: true, lastName: true }
    });

    if (!person) return null;

    return await prisma.notification.create({
      data: {
        userId: mentorId,
        personId: personId,
        type: Constants.NOTIFICATION_TYPES.NEW_ASSIGNMENT,
        title: 'Nouvelle attribution',
        message: `${person.firstName} ${person.lastName} vous a été assigné(e) pour suivi`,
        actionUrl: `/persons/${personId}`
      }
    });
  }

  /**
   * Notification changement de statut
   */
  static async createStatusChangeNotification(mentorId, personId, newStatus) {
    const prisma = database.getClient();
    
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { firstName: true, lastName: true }
    });

    if (!person) return null;

    const statusLabels = {
      [Constants.PERSON_STATUS.TO_VISIT]: 'à visiter',
      [Constants.PERSON_STATUS.IN_FOLLOW_UP]: 'en suivi',
      [Constants.PERSON_STATUS.INTEGRATED]: 'intégré(e)',
      [Constants.PERSON_STATUS.TO_REDIRECT]: 'à réorienter',
      [Constants.PERSON_STATUS.LONG_ABSENT]: 'absent(e) prolongé(e)'
    };

    return await prisma.notification.create({
      data: {
        userId: mentorId,
        personId: personId,
        type: Constants.NOTIFICATION_TYPES.STATUS_CHANGE,
        title: 'Changement de statut',
        message: `${person.firstName} ${person.lastName} est maintenant ${statusLabels[newStatus]}`,
        actionUrl: `/persons/${personId}`
      }
    });
  }

  /**
   * Notification rappel de suivi
   */
  static async createFollowUpReminder(mentorId, personId, daysSinceLastContact) {
    const prisma = database.getClient();
    
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { firstName: true, lastName: true }
    });

    if (!person) return null;

    return await prisma.notification.create({
      data: {
        userId: mentorId,
        personId: personId,
        type: Constants.NOTIFICATION_TYPES.FOLLOW_UP_REMINDER,
        title: 'Suivi en attente',
        message: `${person.firstName} ${person.lastName} attend un suivi depuis ${daysSinceLastContact} jours`,
        actionUrl: `/persons/${personId}`
      }
    });
  }

  /**
   * Notification visite en retard
   */
  static async createOverdueVisitNotification(mentorId, personId, daysOverdue) {
    const prisma = database.getClient();
    
    const person = await prisma.person.findUnique({
      where: { id: personId },
      select: { firstName: true, lastName: true }
    });

    if (!person) return null;

    return await prisma.notification.create({
      data: {
        userId: mentorId,
        personId: personId,
        type: Constants.NOTIFICATION_TYPES.OVERDUE_VISIT,
        title: 'Visite en retard',
        message: `Visite de ${person.firstName} ${person.lastName} en retard de ${daysOverdue} jours`,
        actionUrl: `/persons/${personId}`
      }
    });
  }

  /**
   * Récupération notifications utilisateur
   */
  static async getUserNotifications(userId, filters = {}) {
    const prisma = database.getClient();
    
    const where = { userId };
    
    if (filters.isRead !== undefined) {
      where.isRead = filters.isRead === 'true';
    }
    
    if (filters.type) {
      where.type = filters.type;
    }

    const { page, limit, skip, take } = Helpers.getPaginationParams(filters.page, filters.limit);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        include: {
          person: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    return {
      ...Helpers.formatPaginatedResponse(notifications, total, page, limit),
      unreadCount
    };
  }

  /**
   * Marquer notification comme lue
   */
  static async markNotificationAsRead(notificationId, userId) {
    const prisma = database.getClient();
    
    return await prisma.notification.update({
      where: {
        id: notificationId,
        userId: userId // Sécurité : s'assurer que la notification appartient à l'utilisateur
      },
      data: {
        isRead: true
      }
    });
  }

  /**
   * Génération automatique de rappels (tâche cron)
   */
  static async generateAutomaticReminders() {
    const prisma = database.getClient();
    
    // Récupérer paramètres de rappel
    const reminderSettings = await prisma.setting.findMany({
      where: {
        key: {
          in: ['reminder_days_new', 'reminder_days_follow_up']
        }
      }
    });

    const reminderDaysNew = parseInt(reminderSettings.find(s => s.key === 'reminder_days_new')?.value) || 3;
    const reminderDaysFollowUp = parseInt(reminderSettings.find(s => s.key === 'reminder_days_follow_up')?.value) || 7;

    // Nouveaux visiteurs sans suivi
    const newPersonsToRemind = await prisma.person.findMany({
      where: {
        status: Constants.PERSON_STATUS.TO_VISIT,
        assignedMentorId: { not: null },
        followUps: { none: {} },
        createdAt: {
          lte: new Date(Date.now() - reminderDaysNew * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        assignedMentor: { select: { id: true } }
      }
    });

    // Créer rappels pour nouveaux
    for (const person of newPersonsToRemind) {
      await this.createFollowUpReminder(
        person.assignedMentor.id,
        person.id,
        reminderDaysNew
      );
    }

    return {
      newReminders: newPersonsToRemind.length
    };
  }
}

module.exports = NotificationService;