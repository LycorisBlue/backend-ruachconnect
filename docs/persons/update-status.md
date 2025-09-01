# Update Person Status

## Endpoint
`PUT /api/v1/persons/{id}/status`

## Description
Change le statut d'un visiteur dans le processus de suivi.

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
  "status": "integrated"
}
```

## Status Values
| Status | Description |
|---------|-------------|
| `to_visit` | À visiter |
| `in_follow_up` | En suivi |
| `integrated` | Intégré |
| `to_redirect` | À rediriger |
| `long_absent` | Longtemps absent |

## Responses

### 200 - Succès
```json
{
  "success": true,
  "message": "Statut du visiteur mis à jour avec succès",
  "data": {
    "id": "12345678-1234-1234-1234-123456789012",
    "firstName": "Marie",
    "lastName": "Kouassi",
    "status": "integrated",
    "updatedAt": "2024-01-25T15:30:00.000Z"
  }
}
```

### 400 - Statut invalide
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Statut invalide"
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