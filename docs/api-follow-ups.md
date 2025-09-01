# API Documentation - Endpoints Follow-ups (Interactions)

## Vue d'ensemble

L'API Follow-ups gère les interactions et le suivi des visiteurs par leurs mentors assignés. Elle permet d'enregistrer, consulter et analyser les interactions de suivi avec des fonctionnalités avancées de filtrage, statistiques et notifications.

**Base URL:** `/api/v1/follow-ups`

---

## 1. Enregistrer une interaction de suivi

### `POST /api/v1/follow-ups`

Crée un nouvel enregistrement d'interaction entre un mentor et un visiteur assigné. Les mentors ne peuvent créer des interactions que pour leurs visiteurs assignés.

#### Rôles autorisés
- `mentor` (pour ses visiteurs assignés uniquement)
- `pastor`, `admin` (pour tous les visiteurs)

#### Paramètres de la requête

**Body (JSON):**
```json
{
  "personId": "uuid",                    // Requis - ID du visiteur
  "interactionType": "visit|call|meeting|other", // Requis
  "interactionDate": "YYYY-MM-DD",       // Requis
  "notes": "string",                     // Requis - Notes de l'interaction
  "outcome": "positive|neutral|negative|no_contact", // Requis
  "nextActionNeeded": true,              // Optionnel - Action de suivi nécessaire
  "nextActionDate": "YYYY-MM-DD",        // Requis si nextActionNeeded = true
  "nextActionNotes": "string"            // Optionnel - Détails de la prochaine action
}
```

**Types d'interactions disponibles:**
- `visit` - Visite à domicile
- `call` - Appel téléphonique  
- `meeting` - Rencontre à l'église
- `other` - Autre type d'interaction

**Résultats possibles:**
- `positive` - Interaction positive
- `neutral` - Interaction neutre
- `negative` - Interaction négative
- `no_contact` - Pas de contact établi

#### Réponse de succès (201)

```json
{
  "success": true,
  "message": "Suivi enregistré avec succès",
  "data": {
    "id": "uuid",
    "personId": "uuid",
    "mentorId": "uuid", 
    "interactionType": "visit",
    "interactionDate": "2024-01-25",
    "outcome": "positive",
    "createdAt": "2024-01-25T18:30:00.000Z"
  }
}
```

#### Codes d'erreur
- **400:** Données invalides ou personId manquant
- **401:** Non authentifié
- **403:** Permissions insuffisantes ou visiteur non assigné au mentor
- **404:** Visiteur non trouvé
- **500:** Erreur serveur

---

## 2. Liste des interactions avec filtres

### `GET /api/v1/follow-ups`

Récupère l'historique paginé des interactions de suivi avec options de filtrage avancées.

#### Rôles autorisés  
- `can_committee`, `mentor`, `pastor`, `admin`
- **Note:** Les mentors ne voient que les interactions de leurs visiteurs assignés

#### Paramètres de requête

| Paramètre | Type | Description | Défaut |
|-----------|------|-------------|--------|
| `page` | integer | Numéro de page (min: 1) | 1 |
| `limit` | integer | Éléments par page (min: 1, max: 100) | 20 |
| `person_id` | uuid | Filtrer par visiteur | - |
| `mentor_id` | uuid | Filtrer par mentor | - |
| `interaction_type` | string | Filtrer par type d'interaction | - |
| `outcome` | string | Filtrer par résultat | - |
| `date_from` | date | Date de début (YYYY-MM-DD) | - |
| `date_to` | date | Date de fin (YYYY-MM-DD) | - |

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Historique des suivis récupéré",
  "data": {
    "followUps": [
      {
        "id": "uuid",
        "personId": "uuid",
        "mentorId": "uuid",
        "interactionType": "visit",
        "interactionDate": "2024-01-25",
        "notes": "Visite à domicile réussie, famille accueillante",
        "outcome": "positive",
        "nextActionNeeded": true,
        "nextActionDate": "2024-02-01", 
        "nextActionNotes": "Inviter à l'étude biblique",
        "createdAt": "2024-01-25T18:30:00.000Z",
        "person": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string"
        },
        "mentor": {
          "id": "uuid", 
          "firstName": "string",
          "lastName": "string"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 87,
      "perPage": 20
    }
  }
}
```

#### Codes d'erreur
- **400:** Paramètres de requête invalides
- **401:** Non authentifié
- **403:** Permissions insuffisantes  
- **500:** Erreur serveur

---

## 3. Statistiques de suivi par mentor

### `GET /api/v1/follow-ups/stats`

Récupère les statistiques d'activité de suivi pour un mentor sur une période donnée.

#### Rôles autorisés
- `mentor` (ses statistiques uniquement)
- `pastor`, `admin` (statistiques de tous les mentors)

#### Paramètres de requête

| Paramètre | Type | Description | Défaut |
|-----------|------|-------------|--------|
| `period` | string | Période d'analyse (week, month, year) | month |
| `mentor_id` | uuid | ID du mentor (ignoré pour les mentors) | - |

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Statistiques de suivi récupérées",
  "data": {
    "mentor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string"
    },
    "period": "month",
    "stats": {
      "totalInteractions": 15,
      "interactionsByType": {
        "visit": 8,
        "call": 5,
        "meeting": 2,
        "other": 0
      },
      "interactionsByOutcome": {
        "positive": 12,
        "neutral": 2, 
        "negative": 1,
        "no_contact": 0
      },
      "activePersons": 6,
      "pendingActions": 3,
      "overdueActions": 1
    }
  }
}
```

#### Codes d'erreur
- **400:** Paramètres invalides ou mentor_id requis
- **401:** Non authentifié
- **403:** Permissions insuffisantes
- **500:** Erreur serveur

---

## 4. Suivis en retard

### `GET /api/v1/follow-ups/overdue`

Récupère la liste des visiteurs qui nécessitent un suivi depuis trop longtemps.

#### Rôles autorisés
- `can_committee`, `mentor`, `pastor`, `admin`
- **Note:** Les mentors ne voient que leurs visiteurs assignés en retard

#### Paramètres de requête

| Paramètre | Type | Description | Défaut |
|-----------|------|-------------|--------|
| `days_threshold` | integer | Nombre de jours de retard minimum | 7 |
| `mentor_id` | uuid | Filtrer par mentor (optionnel) | - |

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Suivis en retard récupérés avec succès",
  "data": {
    "overdueFollowUps": [
      {
        "person": {
          "id": "uuid",
          "firstName": "Marie",
          "lastName": "Kouassi",
          "status": "in_follow_up"
        },
        "assignedMentor": {
          "id": "uuid",
          "firstName": "Jean", 
          "lastName": "Dupont"
        },
        "daysSinceLastInteraction": 10,
        "lastInteractionDate": "2024-01-15"
      }
    ],
    "total": 5
  }
}
```

#### Codes d'erreur
- **400:** Paramètres invalides
- **401:** Non authentifié
- **403:** Permissions insuffisantes
- **500:** Erreur serveur

---

## 5. Prochaines actions programmées

### `GET /api/v1/follow-ups/upcoming-actions`

Récupère la liste des actions de suivi programmées à venir pour un mentor.

#### Rôles autorisés
- `mentor` (ses actions uniquement)
- `pastor`, `admin` (actions de tous les mentors)

#### Paramètres de requête

| Paramètre | Type | Description | Défaut |
|-----------|------|-------------|--------|
| `days` | integer | Horizon en jours (actions dans les X prochains jours) | 7 |
| `mentor_id` | uuid | ID du mentor (ignoré pour les mentors) | - |

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Prochaines actions récupérées",
  "data": {
    "actionsCount": 3,
    "actions": [
      {
        "id": "uuid",
        "personId": "uuid", 
        "nextActionDate": "2024-01-30",
        "nextActionNotes": "Inviter à l'étude biblique",
        "person": {
          "firstName": "Marie",
          "lastName": "Kouassi",
          "phone": "+225 01 02 03 04 05"
        },
        "lastInteraction": {
          "date": "2024-01-25",
          "type": "visit",
          "outcome": "positive"
        }
      }
    ]
  }
}
```

#### Codes d'erreur
- **400:** Paramètres invalides ou mentor_id requis
- **401:** Non authentifié  
- **403:** Permissions insuffisantes
- **500:** Erreur serveur

---

## Modèles de données

### Objet FollowUp (complet)

```json
{
  "id": "uuid",
  "personId": "uuid", 
  "mentorId": "uuid",
  "interactionType": "visit|call|meeting|other",
  "interactionDate": "YYYY-MM-DD",
  "notes": "string",
  "outcome": "positive|neutral|negative|no_contact",
  "nextActionNeeded": true,
  "nextActionDate": "YYYY-MM-DD", 
  "nextActionNotes": "string",
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Objet Person (dans les réponses follow-up)

```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",          // Seulement dans certaines réponses
  "status": "string"          // Seulement dans certaines réponses
}
```

### Objet Mentor (dans les réponses follow-up)

```json
{
  "id": "uuid", 
  "firstName": "string",
  "lastName": "string"
}
```

### Objet Statistics

```json
{
  "totalInteractions": "integer",
  "interactionsByType": {
    "visit": "integer",
    "call": "integer", 
    "meeting": "integer",
    "other": "integer"
  },
  "interactionsByOutcome": {
    "positive": "integer",
    "neutral": "integer",
    "negative": "integer", 
    "no_contact": "integer"
  },
  "activePersons": "integer",
  "pendingActions": "integer",
  "overdueActions": "integer"
}
```

---

## Règles métier

### Sécurité et permissions
- **Mentors:** Ne peuvent créer des interactions que pour leurs visiteurs assignés
- **Validation d'assignation:** Vérification automatique de la relation mentor-visiteur
- **Filtrage automatique:** Les mentors ne voient que leurs données dans toutes les requêtes

### Gestion des interactions
- **Champs obligatoires:** personId, interactionType, interactionDate, notes, outcome
- **Actions de suivi:** Si nextActionNeeded = true, nextActionDate devient obligatoire
- **Horodatage automatique:** Timestamp de création généré automatiquement

### Calculs et statistiques  
- **Suivis en retard:** Basés sur la date de dernière interaction + seuil configurable
- **Actions à venir:** Filtrées par nextActionDate dans la période spécifiée
- **Statistiques:** Calculées en temps réel sur la période sélectionnée

### Notifications automatiques
- **Nouveau suivi:** Notification générée lors de création d'interaction
- **Actions en retard:** Rappels automatiques selon configuration système
- **Assignement:** Notification au mentor lors de nouvelle assignation

---

## Exemples d'utilisation

### Créer une visite à domicile avec action de suivi

```bash
POST /api/v1/follow-ups
Content-Type: application/json
Authorization: Bearer <token>

{
  "personId": "12345678-1234-1234-1234-123456789012",
  "interactionType": "visit", 
  "interactionDate": "2024-01-25",
  "notes": "Première visite à domicile. Famille très accueillante, intéressée par les activités de l'église.",
  "outcome": "positive",
  "nextActionNeeded": true,
  "nextActionDate": "2024-02-01",
  "nextActionNotes": "Inviter à participer à l'étude biblique du jeudi"
}
```

### Consulter les suivis en retard pour un mentor

```bash
GET /api/v1/follow-ups/overdue?days_threshold=10
Authorization: Bearer <token-mentor>
```

### Obtenir les statistiques mensuelles d'un mentor

```bash
GET /api/v1/follow-ups/stats?period=month&mentor_id=87654321-4321-4321-4321-210987654321
Authorization: Bearer <token-pastor>
```