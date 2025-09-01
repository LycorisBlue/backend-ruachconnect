const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'RuachConnect API',
      version: '1.0.0',
      description: 'API backend pour le recensement et suivi des nouveaux visiteurs - Église Ruach',
      contact: {
        name: 'Équipe RuachConnect',
        email: 'contact@ruach.church'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Serveur de développement'
      },
      {
        url: 'https://api.ruachconnect.church/api/v1',
        description: 'Serveur de production'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Entrez le token JWT obtenu lors de la connexion'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique de l\'utilisateur'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email de l\'utilisateur'
            },
            firstName: {
              type: 'string',
              description: 'Prénom de l\'utilisateur'
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille de l\'utilisateur'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone'
            },
            role: {
              type: 'string',
              enum: ['can_committee', 'mentor', 'pastor', 'admin'],
              description: 'Rôle de l\'utilisateur'
            },
            churchSection: {
              type: 'string',
              description: 'Section d\'église responsable'
            },
            isActive: {
              type: 'boolean',
              description: 'Statut actif de l\'utilisateur'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        Person: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique de la personne'
            },
            firstName: {
              type: 'string',
              description: 'Prénom'
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille'
            },
            gender: {
              type: 'string',
              enum: ['M', 'F'],
              description: 'Genre (M = Masculin, F = Féminin)'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Date de naissance'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email'
            },
            address: {
              type: 'string',
              description: 'Adresse complète'
            },
            commune: {
              type: 'string',
              description: 'Commune de résidence'
            },
            quartier: {
              type: 'string',
              description: 'Quartier de résidence'
            },
            profession: {
              type: 'string',
              description: 'Profession'
            },
            maritalStatus: {
              type: 'string',
              enum: ['single', 'married', 'divorced', 'widowed'],
              description: 'Statut matrimonial'
            },
            firstVisitDate: {
              type: 'string',
              format: 'date',
              description: 'Date de première visite à l\'église'
            },
            howHeardAboutChurch: {
              type: 'string',
              description: 'Comment la personne a connu l\'église'
            },
            prayerRequests: {
              type: 'string',
              description: 'Demandes de prière'
            },
            photoUrl: {
              type: 'string',
              format: 'uri',
              description: 'URL de la photo de profil'
            },
            status: {
              type: 'string',
              enum: ['to_visit', 'in_follow_up', 'integrated', 'to_redirect', 'long_absent'],
              description: 'Statut du suivi'
            },
            assignedMentorId: {
              type: 'string',
              format: 'uuid',
              description: 'ID du mentor assigné'
            },
            createdBy: {
              type: 'string',
              format: 'uuid',
              description: 'ID de l\'utilisateur qui a créé l\'enregistrement'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        FollowUp: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique du suivi'
            },
            personId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la personne suivie'
            },
            mentorId: {
              type: 'string',
              format: 'uuid',
              description: 'ID du mentor responsable du suivi'
            },
            interactionType: {
              type: 'string',
              enum: ['visit', 'call', 'meeting', 'other'],
              description: 'Type d\'interaction'
            },
            interactionDate: {
              type: 'string',
              format: 'date',
              description: 'Date de l\'interaction'
            },
            notes: {
              type: 'string',
              description: 'Notes sur l\'interaction'
            },
            outcome: {
              type: 'string',
              enum: ['positive', 'neutral', 'negative', 'no_contact'],
              description: 'Résultat de l\'interaction'
            },
            nextActionNeeded: {
              type: 'boolean',
              description: 'Une action de suivi est-elle nécessaire ?'
            },
            nextActionDate: {
              type: 'string',
              format: 'date',
              description: 'Date prévue pour la prochaine action'
            },
            nextActionNotes: {
              type: 'string',
              description: 'Notes pour la prochaine action'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de dernière modification'
            }
          }
        },
        Notification: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'Identifiant unique de la notification'
            },
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de l\'utilisateur destinataire'
            },
            personId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la personne concernée (optionnel)'
            },
            type: {
              type: 'string',
              enum: ['new_assignment', 'follow_up_reminder', 'overdue_visit', 'status_change'],
              description: 'Type de notification'
            },
            title: {
              type: 'string',
              description: 'Titre de la notification'
            },
            message: {
              type: 'string',
              description: 'Message de la notification'
            },
            isRead: {
              type: 'boolean',
              description: 'Notification lue ou non'
            },
            actionUrl: {
              type: 'string',
              description: 'URL d\'action associée'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Date de création'
            }
          }
        },
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Indique si la requête a réussi'
            },
            message: {
              type: 'string',
              description: 'Message descriptif'
            },
            data: {
              type: 'object',
              description: 'Données de réponse'
            }
          }
        },
        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: 'Indique que la requête a échoué'
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                  description: 'Code d\'erreur'
                },
                message: {
                  type: 'string',
                  description: 'Message d\'erreur'
                },
                details: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string',
                        description: 'Champ concerné par l\'erreur'
                      },
                      message: {
                        type: 'string',
                        description: 'Message d\'erreur spécifique'
                      }
                    }
                  }
                }
              }
            }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email de connexion'
            },
            password: {
              type: 'string',
              description: 'Mot de passe'
            }
          }
        },
        CreatePersonRequest: {
          type: 'object',
          required: ['firstName', 'lastName', 'gender', 'firstVisitDate'],
          properties: {
            firstName: {
              type: 'string',
              description: 'Prénom (obligatoire)'
            },
            lastName: {
              type: 'string',
              description: 'Nom de famille (obligatoire)'
            },
            gender: {
              type: 'string',
              enum: ['M', 'F'],
              description: 'Genre (obligatoire)'
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Date de naissance'
            },
            phone: {
              type: 'string',
              description: 'Numéro de téléphone'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Adresse email'
            },
            address: {
              type: 'string',
              description: 'Adresse complète'
            },
            commune: {
              type: 'string',
              description: 'Commune de résidence'
            },
            quartier: {
              type: 'string',
              description: 'Quartier de résidence'
            },
            profession: {
              type: 'string',
              description: 'Profession'
            },
            maritalStatus: {
              type: 'string',
              enum: ['single', 'married', 'divorced', 'widowed'],
              description: 'Statut matrimonial'
            },
            firstVisitDate: {
              type: 'string',
              format: 'date',
              description: 'Date de première visite (obligatoire)'
            },
            howHeardAboutChurch: {
              type: 'string',
              description: 'Comment la personne a connu l\'église'
            },
            prayerRequests: {
              type: 'string',
              description: 'Demandes de prière'
            }
          }
        },
        CreateFollowUpRequest: {
          type: 'object',
          required: ['personId', 'interactionType', 'interactionDate', 'outcome'],
          properties: {
            personId: {
              type: 'string',
              format: 'uuid',
              description: 'ID de la personne (obligatoire)'
            },
            interactionType: {
              type: 'string',
              enum: ['visit', 'call', 'meeting', 'other'],
              description: 'Type d\'interaction (obligatoire)'
            },
            interactionDate: {
              type: 'string',
              format: 'date',
              description: 'Date de l\'interaction (obligatoire)'
            },
            notes: {
              type: 'string',
              description: 'Notes sur l\'interaction'
            },
            outcome: {
              type: 'string',
              enum: ['positive', 'neutral', 'negative', 'no_contact'],
              description: 'Résultat de l\'interaction (obligatoire)'
            },
            nextActionNeeded: {
              type: 'boolean',
              description: 'Une action de suivi est-elle nécessaire ?'
            },
            nextActionDate: {
              type: 'string',
              format: 'date',
              description: 'Date prévue pour la prochaine action'
            },
            nextActionNotes: {
              type: 'string',
              description: 'Notes pour la prochaine action'
            }
          }
        }
      },
      responses: {
        Success: {
          description: 'Opération réussie',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiResponse'
              }
            }
          }
        },
        BadRequest: {
          description: 'Requête invalide - Erreur de validation',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                error: {
                  code: 'VALIDATION_ERROR',
                  message: 'Données invalides',
                  details: [
                    {
                      field: 'email',
                      message: 'Format email invalide'
                    }
                  ]
                }
              }
            }
          }
        },
        Unauthorized: {
          description: 'Non autorisé - Token JWT manquant ou invalide',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                error: {
                  code: 'UNAUTHORIZED',
                  message: 'Token d\'authentification manquant ou invalide'
                }
              }
            }
          }
        },
        Forbidden: {
          description: 'Accès refusé - Permissions insuffisantes',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                error: {
                  code: 'FORBIDDEN',
                  message: 'Accès refusé pour ce rôle'
                }
              }
            }
          }
        },
        NotFound: {
          description: 'Ressource non trouvée',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                error: {
                  code: 'NOT_FOUND',
                  message: 'Ressource non trouvée'
                }
              }
            }
          }
        },
        InternalError: {
          description: 'Erreur interne du serveur',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ApiError'
              },
              example: {
                success: false,
                error: {
                  code: 'INTERNAL_ERROR',
                  message: 'Erreur interne du serveur'
                }
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'Endpoints d\'authentification et de gestion des sessions'
      },
      {
        name: 'Persons',
        description: 'Gestion des nouveaux visiteurs de l\'église'
      },
      {
        name: 'Follow-ups',
        description: 'Suivi et historique des interactions'
      },
      {
        name: 'Users',
        description: 'Gestion des utilisateurs du système'
      },
      {
        name: 'Statistics',
        description: 'Statistiques et rapports'
      },
      {
        name: 'Notifications',
        description: 'Système de notifications'
      },
      {
        name: 'Upload',
        description: 'Upload de fichiers et photos'
      }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const specs = swaggerJSDoc(options);

module.exports = {
  specs,
  swaggerUi,
  serve: swaggerUi.serve,
  setup: swaggerUi.setup(specs, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'RuachConnect API Documentation'
  })
};