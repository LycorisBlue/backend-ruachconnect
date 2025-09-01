# Logout

## Endpoint
`POST /api/v1/auth/logout`

## Description
Invalide le token JWT de l'utilisateur connecté.

## Headers
```
Authorization: Bearer <token>
Content-Type: application/json
```

## Body
Aucun body requis.

## Responses

### 200 - Succès
```json
{
  "success": true,
  "message": "Déconnexion réussie"
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

### 500 - Erreur serveur
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erreur interne du serveur"
  }
}
```