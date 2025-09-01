# Get Person By ID

## Endpoint
`GET /api/v1/persons/{id}`

## Description
Récupère les informations complètes d'un visiteur avec son historique de suivi.

## Headers
```
Authorization: Bearer <token>
```

## Permissions
Rôles autorisés: `can_committee`, `mentor`, `pastor`, `admin`

## Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID unique du visiteur |

## Responses

### 200 - Succès
```json
{
  "success": true,
  "message": "Détails du visiteur récupérés avec succès",
  "data": {
    "id": "12345678-1234-1234-1234-123456789012",
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
    "prayerRequests": "Prière pour sa famille",
    "status": "in_follow_up",
    "assignedMentor": {
      "id": "87654321-4321-4321-4321-210987654321",
      "firstName": "Jean",
      "lastName": "Dupont",
      "phone": "+225 06 07 08 09 10",
      "churchSection": "Jeunes"
    },
    "followUps": [
      {
        "id": "11111111-1111-1111-1111-111111111111",
        "interactionDate": "2024-01-20",
        "interactionType": "call",
        "notes": "Premier contact téléphonique positif",
        "outcome": "positive",
        "mentorName": "Jean Dupont"
      }
    ],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:30:00.000Z"
  }
}
```

### 400 - ID invalide
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ID invalide"
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

### 404 - Visiteur non trouvé
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Visiteur non trouvé"
  }
}
```

## Exemple d'appel
```
GET /api/v1/persons/12345678-1234-1234-1234-123456789012
```