class ApiResponse {
  static success(res, message, data = null) {
    return res.status(200).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static created(res, message, data = null) {
    return res.status(201).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static badRequest(res, message, details = null) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message,
        details
      },
      timestamp: new Date().toISOString()
    });
  }

  static unauthorized(res, message = 'Non autorisé') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message
      },
      timestamp: new Date().toISOString()
    });
  }

  static forbidden(res, message = 'Accès refusé') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'FORBIDDEN',
        message
      },
      timestamp: new Date().toISOString()
    });
  }

  static notFound(res, message = 'Ressource non trouvée') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message
      },
      timestamp: new Date().toISOString()
    });
  }

  static serverError(res, message = 'Erreur interne du serveur') {
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message
      },
      timestamp: new Date().toISOString()
    });
  }

  static validationError(res, message, details) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details
      },
      timestamp: new Date().toISOString()
    });
  }
}

module.exports = ApiResponse;