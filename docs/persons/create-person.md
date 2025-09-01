# Create Person

## Endpoint
`POST /api/v1/persons`

## Description
Enregistre un nouveau visiteur avec attribution automatique d'un mentor.

## Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Permissions
Rôles autorisés: `can_committee`, `pastor`, `admin`

## Body
```json
{
  "firstName": "Marie",
  "lastName": "Kouassi",
  "gender": "F",
  "phone": "+225 01 02 03 04 05",
  "email": "marie@example.com",
  "commune": "Cocody",
  "quartier": "Riviera",
  "profession": "Enseignante",
  "maritalStatus": "single",
  "firstVisitDate": "2024-01-15",
  "howHeardAboutChurch": "Invitée par une amie",
  "prayerRequests": "Prière pour sa famille"
}
```

## Responses

### 201 - Succès
```json
{
  "success": true,
  "message": "Visiteur enregistré avec succès",
  "data": {
    "id": "12345678-1234-1234-1234-123456789012",
    "firstName": "Marie",
    "lastName": "Kouassi",
    "status": "to_visit",
    "assignedMentor": {
      "id": "87654321-4321-4321-4321-210987654321",
      "firstName": "Jean",
      "lastName": "Dupont"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
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

### 403 - Permission refusée
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Accès refusé"
  }
}
```