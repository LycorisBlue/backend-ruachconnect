# Get Persons

## Endpoint
`GET /api/v1/persons`

## Description
Récupère la liste des visiteurs avec options de filtrage et pagination.

## Headers
```
Authorization: Bearer <token>
```

## Permissions
Rôles autorisés: `can_committee`, `mentor`, `pastor`, `admin`

## Query Parameters
| Parameter | Type | Description | Valeurs |
|-----------|------|-------------|---------|
| `page` | integer | Numéro de page | Défaut: 1 |
| `limit` | integer | Éléments par page | 1-100, Défaut: 20 |
| `status` | string | Filtrer par statut | `to_visit`, `in_follow_up`, `integrated`, `to_redirect`, `long_absent` |
| `mentor_id` | uuid | Filtrer par mentor | ID du mentor |
| `search` | string | Recherche nom/prénom | |
| `commune` | string | Filtrer par commune | |
| `date_from` | date | Date début | Format: YYYY-MM-DD |
| `date_to` | date | Date fin | Format: YYYY-MM-DD |

## Responses

### 200 - Succès
```json
{
  "success": true,
  "message": "Liste des visiteurs récupérée avec succès",
  "data": {
    "persons": [
      {
        "id": "12345678-1234-1234-1234-123456789012",
        "firstName": "Marie",
        "lastName": "Kouassi",
        "phone": "+225 01 02 03 04 05",
        "commune": "Cocody",
        "status": "in_follow_up",
        "firstVisitDate": "2024-01-15",
        "assignedMentor": {
          "id": "87654321-4321-4321-4321-210987654321",
          "firstName": "Jean",
          "lastName": "Dupont"
        },
        "lastInteraction": "2024-01-20"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "perPage": 20
    }
  }
}
```

### 400 - Paramètres invalides
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Paramètres de requête invalides"
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

## Exemple d'appel
```
GET /api/v1/persons?status=to_visit&page=1&limit=10&commune=Cocody
```