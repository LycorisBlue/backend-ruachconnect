const database = require('../config/database');
const Constants = require('../utils/constants');
const Helpers = require('../utils/helpers');
const NotificationService = require('./NotificationService');

class PersonService {
  /**
   * Création nouveau visiteur avec auto-assignment
   */
  static async createPerson(personData, createdBy) {
    const prisma = database.getClient();
    
    // Nettoyage des données
    const sanitizedData = Helpers.sanitizeUserInput(personData);
    
    // Attribution automatique du mentor
    const mentor = await this.findAvailableMentor();
    
    const person = await prisma.person.create({
      data: {
        firstName: Helpers.capitalizeName(sanitizedData.firstName),
        lastName: Helpers.capitalizeName(sanitizedData.lastName),
        gender: sanitizedData.gender,
        dateOfBirth: sanitizedData.dateOfBirth ? new Date(sanitizedData.dateOfBirth) : null,
        phone: Helpers.normalizePhone(sanitizedData.phone),
        email: sanitizedData.email?.toLowerCase(),
        address: sanitizedData.address,
        commune: sanitizedData.commune,
        quartier: sanitizedData.quartier,
        profession: sanitizedData.profession,
        maritalStatus: sanitizedData.maritalStatus,
        firstVisitDate: new Date(sanitizedData.firstVisitDate),
        howHeardAboutChurch: sanitizedData.howHeardAboutChurch,
        prayerRequests: sanitizedData.prayerRequests,
        status: Constants.PERSON_STATUS.TO_VISIT,
        assignedMentorId: mentor?.id,
        createdBy
      },
      include: {
        assignedMentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            churchSection: true
          }
        },
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Créer notification pour le mentor assigné
    if (mentor) {
      await NotificationService.createAssignmentNotification(mentor.id, person.id);
    }

    return person;
  }

  /**
   * Recherche mentor disponible (auto-assignment)
   */
  static async findAvailableMentor() {
    const prisma = database.getClient();
    
    // Récupérer paramètre max personnes par mentor
    const maxPersonsSetting = await prisma.setting.findUnique({
      where: { key: 'max_persons_per_mentor' }
    });
    
    const maxPersons = parseInt(maxPersonsSetting?.value) || Constants.DEFAULT_SETTINGS.MAX_PERSONS_PER_MENTOR;
    
    // Trouver mentor avec le moins de personnes assignées
    const mentors = await prisma.user.findMany({
      where: {
        role: Constants.USER_ROLES.MENTOR,
        isActive: true
      },
      include: {
        _count: {
          select: {
            assignedPersons: {
              where: {
                status: {
                  in: [
                    Constants.PERSON_STATUS.TO_VISIT,
                    Constants.PERSON_STATUS.IN_FOLLOW_UP
                  ]
                }
              }
            }
          }
        }
      },
      orderBy: {
        assignedPersons: {
          _count: 'asc'
        }
      }
    });

    // Retourner le premier mentor qui n'a pas atteint la limite
    return mentors.find(mentor => mentor._count.assignedPersons < maxPersons) || null;
  }

  /**
   * Liste des personnes avec filtres et pagination
   */
  static async getPersonsList(filters = {}, pagination = {}) {
    const prisma = database.getClient();
    
    const { page, limit, skip, take } = Helpers.getPaginationParams(pagination.page, pagination.limit);
    
    // Construction des filtres WHERE
    const where = {};
    
    if (filters.status) {
      where.status = filters.status;
    }
    
    if (filters.mentorId) {
      where.assignedMentorId = filters.mentorId;
    }
    
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } }
      ];
    }
    
    if (filters.commune) {
      where.commune = { contains: filters.commune };
    }
    
    if (filters.dateFrom || filters.dateTo) {
      where.firstVisitDate = {};
      if (filters.dateFrom) where.firstVisitDate.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.firstVisitDate.lte = new Date(filters.dateTo);
    }

    // Requête avec pagination
    const [persons, total] = await Promise.all([
      prisma.person.findMany({
        where,
        include: {
          assignedMentor: {
            select: {
              id: true,
              firstName: true,
              lastName: true
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.person.count({ where })
    ]);

    return Helpers.formatPaginatedResponse(persons, total, page, limit);
  }

  /**
   * Détails d'une personne avec historique complet
   */
  static async getPersonById(personId, userRole, userId) {
    const prisma = database.getClient();
    
    // Construction filtres selon rôle
    const where = { id: personId };
    
    // Mentors ne voient que leurs assignés
    if (userRole === Constants.USER_ROLES.MENTOR) {
      where.assignedMentorId = userId;
    }
    
    const person = await prisma.person.findUnique({
      where,
      include: {
        assignedMentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            churchSection: true
          }
        },
        followUps: {
          include: {
            mentor: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          },
          orderBy: { interactionDate: 'desc' }
        },
        creator: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!person) {
      throw new Error('Personne non trouvée');
    }

    return person;
  }

  /**
   * Mise à jour statut avec historique
   */
  static async updatePersonStatus(personId, newStatus, notes, userId) {
    const prisma = database.getClient();
    
    const person = await prisma.person.update({
      where: { id: personId },
      data: { 
        status: newStatus,
        updatedAt: new Date()
      },
      include: {
        assignedMentor: {
          select: { id: true, firstName: true, lastName: true }
        }
      }
    });

    // Créer notification de changement de statut
    if (person.assignedMentorId) {
      await NotificationService.createStatusChangeNotification(
        person.assignedMentorId,
        personId,
        newStatus
      );
    }

    return person;
  }

  /**
   * Réassignation mentor
   */
  static async assignMentor(personId, newMentorId, notes, assignedBy) {
    const prisma = database.getClient();
    
    const person = await prisma.person.update({
      where: { id: personId },
      data: {
        assignedMentorId: newMentorId,
        updatedAt: new Date()
      },
      include: {
        assignedMentor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            churchSection: true
          }
        }
      }
    });

    // Créer notification pour le nouveau mentor
    await NotificationService.createAssignmentNotification(newMentorId, personId);
    
    return person;
  }
}

module.exports = PersonService;