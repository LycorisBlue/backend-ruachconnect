# Assign Mentor

## Endpoint
`PUT /api/v1/persons/{id}/assign-mentor`

## Description
Assigne ou réassigne un mentor à un visiteur.

## Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Permissions
Rôles autorisés: `can_committee`, `pastor`, `admin`

## Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID unique du visiteur |

## Body
```json
{
  "mentorId": "87654321-4321-4321-4321-210987654321"
}
```

## Responses

### 200 - Succès
```json
{
  "success": true,
  "message": "Mentor assigné avec succès",
  "data": {
    "id": "12345678-1234-1234-1234-123456789012",
    "firstName": "Marie",
    "lastName": "Kouassi",
    "assignedMentor": {
      "id": "87654321-4321-4321-4321-210987654321",
      "firstName": "Pierre",
      "lastName": "Martin",
      "churchSection": "Adultes"
    },
    "updatedAt": "2024-01-25T16:00:00.000Z"
  }
}
```

### 400 - Données invalides
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "ID du mentor invalide"
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
    "message": "Seuls les responsables CAN, pasteurs et admins peuvent assigner des mentors"
  }
}
```

### 404 - Ressource non trouvée
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Visiteur ou mentor non trouvé"
  }
}
```

## Notes
- Le mentor doit avoir le rôle `mentor` actif
- Une notification est automatiquement envoyée au nouveau mentor