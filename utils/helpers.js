const { format, parseISO, isValid, addDays, differenceInDays } = require('date-fns');
const { fr } = require('date-fns/locale');

class Helpers {
  /**
   * Formatage des dates en français
   */
  static formatDate(date, pattern = 'dd/MM/yyyy') {
    if (!date) return null;
    
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(dateObj)) return null;
      
      return format(dateObj, pattern, { locale: fr });
    } catch (error) {
      return null;
    }
  }

  /**
   * Validation format téléphone (français/international)
   */
  static isValidPhone(phone) {
    if (!phone) return false;
    
    // Nettoyer le numéro
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Formats acceptés:
    // +33123456789, 0123456789, +225 XX XX XX XX XX
    const patterns = [
      /^\+33[1-9]\d{8}$/, // France
      /^0[1-9]\d{8}$/, // France local
      /^\+225\d{8,10}$/, // Côte d'Ivoire
      /^\d{8,10}$/ // Local générique
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  }

  /**
   * Normalisation téléphone
   */
  static normalizePhone(phone) {
    if (!phone) return null;
    
    let cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Ajouter +33 si numéro français sans préfixe
    if (/^0[1-9]\d{8}$/.test(cleaned)) {
      cleaned = '+33' + cleaned.substring(1);
    }
    
    return cleaned;
  }

  /**
   * Validation email
   */
  static isValidEmail(email) {
    if (!email) return false;
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.toLowerCase());
  }

  /**
   * Génération nom complet
   */
  static getFullName(firstName, lastName) {
    return `${firstName || ''} ${lastName || ''}`.trim();
  }

  /**
   * Capitalisation des noms
   */
  static capitalizeName(name) {
    if (!name) return '';
    
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Calcul âge à partir date de naissance
   */
  static calculateAge(dateOfBirth) {
    if (!dateOfBirth) return null;
    
    try {
      const birthDate = typeof dateOfBirth === 'string' ? parseISO(dateOfBirth) : dateOfBirth;
      if (!isValid(birthDate)) return null;
      
      return differenceInDays(new Date(), birthDate) / 365.25;
    } catch (error) {
      return null;
    }
  }

  /**
   * Calcul jours depuis dernière interaction
   */
  static daysSinceLastInteraction(lastDate) {
    if (!lastDate) return null;
    
    try {
      const lastInteraction = typeof lastDate === 'string' ? parseISO(lastDate) : lastDate;
      if (!isValid(lastInteraction)) return null;
      
      return differenceInDays(new Date(), lastInteraction);
    } catch (error) {
      return null;
    }
  }

  /**
   * Génération date prochaine action
   */
  static getNextActionDate(daysToAdd = 7) {
    return addDays(new Date(), daysToAdd);
  }

  /**
   * Nettoyage données utilisateur
   */
  static sanitizeUserInput(data) {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'string') {
        sanitized[key] = value.trim();
      } else {
        sanitized[key] = value;
      }
    }
    
    return sanitized;
  }

  /**
   * Masquage données sensibles pour logs
   */
  static maskSensitiveData(data) {
    const masked = { ...data };
    const sensitiveFields = ['password', 'passwordHash', 'token', 'email'];
    
    sensitiveFields.forEach(field => {
      if (masked[field]) {
        masked[field] = '***masked***';
      }
    });
    
    return masked;
  }

  /**
   * Génération slug pour URLs
   */
  static generateSlug(text) {
    if (!text) return '';
    
    return text
      .toLowerCase()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Validation UUID
   */
  static isValidUUID(uuid) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  /**
   * Pagination helper
   */
  static getPaginationParams(page, limit) {
    const pageNum = parseInt(page) || 1;
    const limitNum = Math.min(parseInt(limit) || 20, 100);
    const skip = (pageNum - 1) * limitNum;
    
    return {
      page: pageNum,
      limit: limitNum,
      skip,
      take: limitNum
    };
  }

  /**
   * Formatage réponse paginée
   */
  static formatPaginatedResponse(data, total, page, limit) {
    const totalPages = Math.ceil(total / limit);
    
    return {
      items: data,
      pagination: {
        current_page: page,
        total_pages: totalPages,
        total_items: total,
        per_page: limit,
        has_next: page < totalPages,
        has_prev: page > 1
      }
    };
  }
}

module.exports = Helpers;