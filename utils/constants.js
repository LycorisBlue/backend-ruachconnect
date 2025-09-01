class Constants {
  // Informations application
  static APP_NAME = "RuachConnect";
  static APP_VERSION = "1.0.0";
  static APP_DESCRIPTION = "Système de recensement et suivi des nouveaux visiteurs - Église Ruach";

  // Rôles utilisateurs
  static USER_ROLES = {
    CAN_COMMITTEE: 'can_committee',
    MENTOR: 'mentor', 
    PASTOR: 'pastor',
    ADMIN: 'admin'
  };

  // Statuts des personnes
  static PERSON_STATUS = {
    TO_VISIT: 'to_visit',
    IN_FOLLOW_UP: 'in_follow_up',
    INTEGRATED: 'integrated',
    TO_REDIRECT: 'to_redirect',
    LONG_ABSENT: 'long_absent'
  };

  // Types d'interactions
  static INTERACTION_TYPES = {
    VISIT: 'visit',
    CALL: 'call',
    MEETING: 'meeting',
    OTHER: 'other'
  };

  // Résultats des interactions
  static OUTCOMES = {
    POSITIVE: 'positive',
    NEUTRAL: 'neutral', 
    NEGATIVE: 'negative',
    NO_CONTACT: 'no_contact'
  };

  // Types de notifications
  static NOTIFICATION_TYPES = {
    NEW_ASSIGNMENT: 'new_assignment',
    FOLLOW_UP_REMINDER: 'follow_up_reminder',
    OVERDUE_VISIT: 'overdue_visit',
    STATUS_CHANGE: 'status_change'
  };

  // Genres
  static GENDERS = {
    MALE: 'M',
    FEMALE: 'F'
  };

  // Statuts maritaux
  static MARITAL_STATUS = {
    SINGLE: 'single',
    MARRIED: 'married',
    DIVORCED: 'divorced',
    WIDOWED: 'widowed'
  };

  // Configuration par défaut
  static DEFAULT_SETTINGS = {
    REMINDER_DAYS_NEW: 3,
    REMINDER_DAYS_FOLLOW_UP: 7,
    AUTO_ASSIGNMENT_ENABLED: true,
    MAX_PERSONS_PER_MENTOR: 10
  };

  // Pagination
  static PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
  };

  // Upload
  static UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['jpg', 'jpeg', 'png'],
    PHOTO_MAX_WIDTH: 800,
    PHOTO_MAX_HEIGHT: 800
  };

  // Messages d'erreur communs
  static ERROR_MESSAGES = {
    UNAUTHORIZED: 'Token d\'authentification requis',
    FORBIDDEN: 'Accès refusé pour ce rôle',
    NOT_FOUND: 'Ressource non trouvée',
    VALIDATION_ERROR: 'Données invalides',
    INTERNAL_ERROR: 'Erreur interne du serveur',
    DUPLICATE_ENTRY: 'Cette entrée existe déjà',
    FILE_TOO_LARGE: 'Fichier trop volumineux',
    INVALID_FILE_TYPE: 'Type de fichier non autorisé'
  };

  // Messages de succès
  static SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Connexion réussie',
    LOGOUT_SUCCESS: 'Déconnexion réussie',
    PERSON_CREATED: 'Visiteur enregistré avec succès',
    PERSON_UPDATED: 'Informations mises à jour',
    STATUS_UPDATED: 'Statut mis à jour',
    FOLLOW_UP_CREATED: 'Interaction enregistrée',
    USER_CREATED: 'Utilisateur créé',
    PHOTO_UPLOADED: 'Photo téléchargée avec succès',
    MENTOR_ASSIGNED: 'Mentor assigné avec succès'
  };
}

module.exports = Constants;