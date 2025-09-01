# API Documentation - Endpoints Persons

## Vue d'ensemble

L'API Persons gère les visiteurs de l'église avec des fonctionnalités complètes de CRUD, de filtrage, de pagination et d'attribution automatique de mentors.

**Base URL:** `/api/v1/persons`

---

## 1. Créer un nouveau visiteur

### `POST /api/v1/persons`

Enregistre un nouveau visiteur avec attribution automatique d'un mentor selon la charge de travail.

#### Rôles autorisés
- `can_committee`, `pastor`, `admin`

#### Paramètres de la requête

**Body (JSON):**
```json
{
  "firstName": "string", // Requis
  "lastName": "string",  // Requis
  "gender": "M|F",      // Requis
  "phone": "string",     // Requis
  "email": "string",     // Optionnel
  "commune": "string",   // Optionnel
  "quartier": "string",  // Optionnel
  "profession": "string", // Optionnel
  "maritalStatus": "single|married|divorced|widowed", // Optionnel
  "firstVisitDate": "YYYY-MM-DD", // Requis
  "howHeardAboutChurch": "string", // Optionnel
  "prayerRequests": "string", // Optionnel
  "dateOfBirth": "YYYY-MM-DD", // Optionnel
  "address": "string" // Optionnel
}
```

#### Réponse de succès (201)

```json
{
  "success": true,
  "message": "Visiteur enregistré avec succès",
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "status": "to_visit",
    "assignedMentor": {
      "id": "uuid",
      "firstName": "string", 
      "lastName": "string"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Codes d'erreur
- **400:** Données invalides
- **401:** Non authentifié
- **403:** Permissions insuffisantes
- **500:** Erreur serveur

---

## 2. Liste des visiteurs avec filtres

### `GET /api/v1/persons`

Récupère la liste paginée des visiteurs avec options de filtrage avancées.

#### Rôles autorisés
- `can_committee`, `mentor`, `pastor`, `admin`
- **Note:** Les mentors ne voient que leurs visiteurs assignés

#### Paramètres de requête

| Paramètre | Type | Description | Défaut |
|-----------|------|-------------|--------|
| `page` | integer | Numéro de page (min: 1) | 1 |
| `limit` | integer | Éléments par page (min: 1, max: 100) | 20 |
| `status` | string | Filtrer par statut | - |
| `mentor_id` | uuid | Filtrer par mentor assigné | - |
| `search` | string | Recherche nom/prénom | - |
| `commune` | string | Filtrer par commune | - |
| `date_from` | date | Date première visite (début) | - |
| `date_to` | date | Date première visite (fin) | - |

**Valeurs status possibles:**
- `to_visit` - À visiter
- `in_follow_up` - En suivi  
- `integrated` - Intégré
- `to_redirect` - À rediriger
- `long_absent` - Longue absence

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Liste des visiteurs récupérée",
  "data": {
    "items": [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string",
        "gender": "M|F",
        "dateOfBirth": "2025-08-30",
        "phone": "string",
        "email": "user@example.com",
        "address": "string",
        "commune": "string", 
        "quartier": "string",
        "profession": "string",
        "maritalStatus": "single|married|divorced|widowed",
        "firstVisitDate": "2025-08-30",
        "howHeardAboutChurch": "string",
        "prayerRequests": "string",
        "photoUrl": "string",
        "status": "to_visit|in_follow_up|integrated|to_redirect|long_absent",
        "assignedMentorId": "uuid",
        "createdBy": "uuid",
        "createdAt": "2025-08-30T15:55:22.669Z",
        "updatedAt": "2025-08-30T15:55:22.669Z",
        "assignedMentor": {
          "id": "uuid",
          "firstName": "string",
          "lastName": "string"
        },
        "followUps": [
          {
            "interactionDate": "2025-08-30",
            "outcome": "positive|neutral|negative|no_contact"
          }
        ]
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 87,
      "per_page": 20,
      "has_next": true,
      "has_prev": false
    }
  }
}
```

#### Codes d'erreur
- **400:** Paramètres invalides
- **401:** Non authentifié 
- **403:** Permissions insuffisantes
- **500:** Erreur serveur

---

## 3. Détails d'un visiteur

### `GET /api/v1/persons/{id}`

Récupère les informations complètes d'un visiteur avec son historique de suivi détaillé.

#### Rôles autorisés
- `can_committee`, `mentor`, `pastor`, `admin`
- **Note:** Les mentors ne voient que leurs visiteurs assignés

#### Paramètres de chemin

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID unique du visiteur |

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Détails du visiteur récupérés avec succès",
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "gender": "M|F",
    "dateOfBirth": "2025-08-30",
    "phone": "string",
    "email": "user@example.com",
    "address": "string", 
    "commune": "string",
    "quartier": "string",
    "profession": "string",
    "maritalStatus": "single|married|divorced|widowed",
    "firstVisitDate": "2025-08-30",
    "howHeardAboutChurch": "string",
    "prayerRequests": "string",
    "photoUrl": "string",
    "status": "to_visit|in_follow_up|integrated|to_redirect|long_absent",
    "assignedMentorId": "uuid",
    "createdBy": "uuid",
    "createdAt": "2025-08-30T15:55:22.669Z",
    "updatedAt": "2025-08-30T15:55:22.669Z",
    "assignedMentor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
      "churchSection": "string"
    },
    "followUps": [
      {
        "id": "uuid",
        "interactionDate": "2024-01-20",
        "interactionType": "visit|call|meeting|other",
        "notes": "string",
        "outcome": "positive|neutral|negative|no_contact",
        "nextActionNeeded": true,
        "nextActionDate": "2024-01-25",
        "nextActionNotes": "string",
        "createdAt": "2024-01-20T10:30:00.000Z",
        "mentor": {
          "firstName": "string",
          "lastName": "string"
        }
      }
    ],
    "creator": {
      "firstName": "string",
      "lastName": "string"
    }
  }
}
```

#### Codes d'erreur
- **400:** ID invalide
- **401:** Non authentifié
- **403:** Permissions insuffisantes  
- **404:** Visiteur non trouvé
- **500:** Erreur serveur

---

## 4. Modifier les informations d'un visiteur

### `PUT /api/v1/persons/{id}`

Met à jour les informations personnelles d'un visiteur.

#### Rôles autorisés
- `can_committee`, `mentor` (ses assignés seulement), `pastor`, `admin`

#### Paramètres de chemin

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID unique du visiteur |

#### Paramètres de la requête

**Body (JSON):** Tous les champs sont optionnels
```json
{
  "firstName": "string",
  "lastName": "string", 
  "gender": "M|F",
  "dateOfBirth": "YYYY-MM-DD",
  "phone": "string",
  "email": "string",
  "address": "string",
  "commune": "string",
  "quartier": "string", 
  "profession": "string",
  "maritalStatus": "single|married|divorced|widowed",
  "firstVisitDate": "YYYY-MM-DD",
  "howHeardAboutChurch": "string",
  "prayerRequests": "string"
}
```

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Informations mises à jour avec succès",
  "data": {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    // ... autres champs mis à jour
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Codes d'erreur
- **400:** Données invalides
- **401:** Non authentifié
- **403:** Permissions insuffisantes
- **404:** Visiteur non trouvé
- **500:** Erreur serveur

---

## 5. Changer le statut d'un visiteur

### `PUT /api/v1/persons/{id}/status`

Met à jour le statut de suivi d'un visiteur avec possibilité d'ajouter des notes.

#### Rôles autorisés
- `can_committee`, `mentor` (ses assignés seulement), `pastor`, `admin`

#### Paramètres de chemin

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID unique du visiteur |

#### Paramètres de la requête

**Body (JSON):**
```json
{
  "status": "to_visit|in_follow_up|integrated|to_redirect|long_absent", // Requis
  "notes": "string" // Optionnel - Notes sur le changement de statut
}
```

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Statut mis à jour avec succès",
  "data": {
    "id": "uuid",
    "status": "in_follow_up",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "assignedMentor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string"
    }
  }
}
```

#### Codes d'erreur
- **400:** Statut invalide
- **401:** Non authentifié
- **403:** Permissions insuffisantes
- **404:** Visiteur non trouvé
- **500:** Erreur serveur

---

## 6. Assigner/réassigner un mentor

### `PUT /api/v1/persons/{id}/assign-mentor`

Assigne ou réassigne un mentor à un visiteur avec notification automatique.

#### Rôles autorisés
- `can_committee`, `pastor`, `admin`

#### Paramètres de chemin

| Paramètre | Type | Description |
|-----------|------|-------------|
| `id` | uuid | ID unique du visiteur |

#### Paramètres de la requête

**Body (JSON):**
```json
{
  "mentorId": "uuid", // Requis - ID du mentor à assigner
  "notes": "string"   // Optionnel - Raison du (ré)assignement
}
```

#### Réponse de succès (200)

```json
{
  "success": true,
  "message": "Mentor assigné avec succès",
  "data": {
    "id": "uuid", 
    "assignedMentorId": "uuid",
    "assignedMentor": {
      "id": "uuid",
      "firstName": "string",
      "lastName": "string",
      "phone": "string",
      "churchSection": "string"
    },
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

#### Codes d'erreur
- **400:** ID mentor invalide
- **401:** Non authentifié
- **403:** Permissions insuffisantes
- **404:** Visiteur ou mentor non trouvé
- **500:** Erreur serveur

---

## Modèles de données

### Objet Person (complet)

```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string", 
  "gender": "M|F",
  "dateOfBirth": "YYYY-MM-DD",
  "phone": "string",
  "email": "string",
  "address": "string",
  "commune": "string",
  "quartier": "string",
  "profession": "string",
  "maritalStatus": "single|married|divorced|widowed", 
  "firstVisitDate": "YYYY-MM-DD",
  "howHeardAboutChurch": "string",
  "prayerRequests": "string",
  "photoUrl": "string",
  "status": "to_visit|in_follow_up|integrated|to_redirect|long_absent",
  "assignedMentorId": "uuid",
  "createdBy": "uuid", 
  "createdAt": "ISO 8601 datetime",
  "updatedAt": "ISO 8601 datetime"
}
```

### Objet Mentor (dans les réponses)

```json
{
  "id": "uuid",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",         // Seulement dans les détails
  "churchSection": "string"  // Seulement dans les détails
}
```

### Objet FollowUp (dans les détails)

```json
{
  "id": "uuid",
  "interactionDate": "YYYY-MM-DD",
  "interactionType": "visit|call|meeting|other",
  "notes": "string",
  "outcome": "positive|neutral|negative|no_contact",
  "nextActionNeeded": true,
  "nextActionDate": "YYYY-MM-DD",
  "nextActionNotes": "string",
  "createdAt": "ISO 8601 datetime",
  "mentor": {
    "firstName": "string",
    "lastName": "string"
  }
}
```

### Objet Pagination

```json
{
  "current_page": 1,
  "total_pages": 10,
  "total_items": 200,
  "per_page": 20,
  "has_next": true,
  "has_prev": false
}
```

---

## Règles métier

### Attribution automatique de mentors
- Lors de la création d'un visiteur, un mentor est automatiquement assigné
- L'attribution se base sur la charge de travail (mentor avec le moins de visiteurs actifs)
- Limite par mentor définie dans les paramètres système (`max_persons_per_mentor`)

### Gestion des permissions
- **Mentors:** Accès limité à leurs visiteurs assignés uniquement
- **CAN Committee:** Peut créer des visiteurs et les assigner
- **Pastors:** Accès en lecture à tous les visiteurs + réassignement
- **Admins:** Accès complet à toutes les fonctionnalités

### Statuts des visiteurs
1. **to_visit:** Nouveau visiteur à contacter
2. **in_follow_up:** En cours de suivi actif
3. **integrated:** Intégré dans la communauté
4. **to_redirect:** À rediriger vers un autre service
5. **long_absent:** Absence prolongée

### Notifications automatiques
- Assignement de nouveau visiteur → Notification au mentor
- Changement de statut → Notification selon configuration
- Suivi en retard → Rappels automatiques