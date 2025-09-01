# Login

## Endpoint
`POST /api/v1/auth/login`

## Description
Authentifie un utilisateur avec email et mot de passe.

## Headers
```
Content-Type: application/json
```

## Body
```json
{
  "email": "admin@ruach.church",
  "password": "admin123"
}
```

## Responses

### 200 - Succès
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "12345678-1234-1234-1234-123456789012",
      "email": "admin@ruach.church",
      "firstName": "Admin",
      "lastName": "System",
      "role": "admin",
      "churchSection": null,
      "isActive": true
    }
  }
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

### 401 - Identifiants incorrects
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou mot de passe incorrect"
  }
}
```

### 429 - Trop de tentatives
```json
{
  "success": false,
  "error": {
    "code": "TOO_MANY_REQUESTS",
    "message": "Trop de tentatives de connexion. Réessayez dans 15 minutes."
  }
}
```

## Rate Limiting
5 tentatives par 15 minutes par IP.