# Update Person

## Endpoint
`PUT /api/v1/persons/{id}`

## Description
Modifie les informations d'un visiteur.

## Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Permissions
Rôles autorisés: `can_committee`, `mentor` (ses assignés), `pastor`, `admin`

## Path Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID unique du visiteur |

## Body
```json
{
  "firstName": "Marie",
  "lastName": "Kouassi",
  "phone": "+225 01 02 03 04 05",
  "email": "marie.kouassi@example.com",
  "commune": "Cocody",
  "quartier": "Riviera Palmeraie",
  "profession": "Directrice d'école",
  "maritalStatus": "married",
  "prayerRequests": "Prière pour sa nouvelle entreprise"
}
```

## Responses

### 200 - Succès
```json
{
  "success": true,
  "message": "Informations du visiteur mises à jour avec succès",
  "data": {
    "id": "12345678-1234-1234-1234-123456789012",
    "firstName": "Marie",
    "lastName": "Kouassi",
    "phone": "+225 01 02 03 04 05",
    "email": "marie.kouassi@example.com",
    "commune": "Cocody",
    "quartier": "Riviera Palmeraie",
    "profession": "Directrice d'école",
    "maritalStatus": "married",
    "prayerRequests": "Prière pour sa nouvelle entreprise",
    "updatedAt": "2024-01-22T10:00:00.000Z"
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
    "message": "Vous ne pouvez modifier que vos visiteurs assignés"
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