# Change Password

## Endpoint
`POST /api/v1/auth/change-password`

## Description
Change le mot de passe de l'utilisateur connecté.

## Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Body
```json
{
  "currentPassword": "motdepasseactuel",
  "newPassword": "nouveaumotdepasse",
  "confirmPassword": "nouveaumotdepasse"
}
```

## Responses

### 200 - Succès
```json
{
  "success": true,
  "message": "Mot de passe changé avec succès"
}
```

### 400 - Données invalides
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données de saisie invalides"
  }
}
```

### 401 - Non autorisé
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token manquant ou invalide"
  }
}
```

### 403 - Mot de passe actuel incorrect
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CURRENT_PASSWORD",
    "message": "Mot de passe actuel incorrect"
  }
}
```

## Validation
- currentPassword: requis
- newPassword: minimum 6 caractères
- confirmPassword: doit correspondre au newPassword