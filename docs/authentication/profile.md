# Profile

## GET Profile
### Endpoint
`GET /api/v1/auth/me`

### Description
Récupère les informations du profil de l'utilisateur authentifié.

### Headers
```
Authorization: Bearer <token>
```

### Responses

#### 200 - Succès
```json
{
  "success": true,
  "message": "Profil récupéré avec succès",
  "data": {
    "id": "12345678-1234-1234-1234-123456789012",
    "email": "mentor@ruach.church",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+225 01 02 03 04 05",
    "role": "mentor",
    "churchSection": "Jeunes",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-20T14:30:00.000Z"
  }
}
```

#### 401 - Non autorisé
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token manquant ou invalide"
  }
}
```

## PUT Profile
### Endpoint
`PUT /api/v1/auth/profile`

### Description
Met à jour les informations du profil utilisateur.

### Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Body
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "+225 01 02 03 04 05",
  "churchSection": "Adultes"
}
```

### Responses

#### 200 - Succès
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès",
  "data": {
    "id": "12345678-1234-1234-1234-123456789012",
    "email": "mentor@ruach.church",
    "firstName": "Jean",
    "lastName": "Dupont",
    "phone": "+225 01 02 03 04 05",
    "role": "mentor",
    "churchSection": "Adultes",
    "isActive": true,
    "updatedAt": "2024-01-20T15:00:00.000Z"
  }
}
```

#### 400 - Données invalides
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données de saisie invalides"
  }
}
```

#### 401 - Non autorisé
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token manquant ou invalide"
  }
}
```