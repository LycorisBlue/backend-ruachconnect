# Documentation Technique Backend - RuachConnect

## Vue d'Ensemble

RuachConnect est une application mobile Flutter pour le recensement et suivi des nouveaux visiteurs dans l'église Ruach. Cette documentation définit les spécifications backend nécessaires pour supporter l'application mobile.

## Architecture Backend

### Technologies Recommandées
- **Base de données**: PostgreSQL ou MySQL
- **Framework**: Node.js (Express), Python (FastAPI/Django), ou PHP (Laravel)
- **Authentification**: JWT tokens
- **Storage**: Local file system ou cloud (photos)
- **Format API**: REST JSON

## Schéma de Base de Données

### Table: users
Gestion des utilisateurs de l'application (CAN, mentors, pasteurs)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('can_committee', 'mentor', 'pastor', 'admin') NOT NULL,
  church_section VARCHAR(100), -- Section d'église responsable
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Table: persons
Enregistrement des nouveaux visiteurs

```sql
CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender ENUM('M', 'F') NOT NULL,
  date_of_birth DATE,
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  commune VARCHAR(100), -- Commune de résidence
  quartier VARCHAR(100), -- Quartier de résidence
  profession VARCHAR(100),
  marital_status ENUM('single', 'married', 'divorced', 'widowed'),
  first_visit_date DATE NOT NULL,
  how_heard_about_church TEXT, -- Comment a connu l'église
  prayer_requests TEXT,
  photo_url VARCHAR(255), -- URL de la photo (optionnelle)
  status ENUM('to_visit', 'in_follow_up', 'integrated', 'to_redirect', 'long_absent') DEFAULT 'to_visit',
  assigned_mentor_id UUID,
  created_by UUID NOT NULL, -- Utilisateur qui a enregistré
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (assigned_mentor_id) REFERENCES users(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### Table: follow_ups
Historique des suivis et interactions

```sql
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID NOT NULL,
  mentor_id UUID NOT NULL,
  interaction_type ENUM('visit', 'call', 'meeting', 'other') NOT NULL,
  interaction_date DATE NOT NULL,
  notes TEXT,
  outcome ENUM('positive', 'neutral', 'negative', 'no_contact') NOT NULL,
  next_action_needed BOOLEAN DEFAULT false,
  next_action_date DATE,
  next_action_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
  FOREIGN KEY (mentor_id) REFERENCES users(id)
);
```

### Table: notifications
Système de notifications et rappels

```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  person_id UUID,
  type ENUM('new_assignment', 'follow_up_reminder', 'overdue_visit', 'status_change') NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  action_url VARCHAR(255), -- Deep link vers l'action
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE
);
```

### Table: settings
Configuration globale de l'application

```sql
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

### Données Initiales Settings
```sql
INSERT INTO settings (key, value, description) VALUES
('reminder_days_new', '3', 'Jours avant rappel pour nouveau visiteur'),
('reminder_days_follow_up', '7', 'Jours avant rappel de suivi régulier'),
('auto_assignment_enabled', 'true', 'Attribution automatique des mentors'),
('max_persons_per_mentor', '10', 'Nombre max de personnes par mentor');
```

## API Endpoints

### Base URL
`https://api.ruachconnect.church/v1`

### Headers Standards
```json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>"
}
```

### Authentification

#### POST /auth/login
Connexion utilisateur

**Request:**
```json
{
  "email": "user@church.com",
  "password": "password123"
}
```

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "id": "uuid",
      "email": "user@church.com",
      "first_name": "Jean",
      "last_name": "Dupont",
      "role": "mentor",
      "church_section": "Jeunes"
    }
  }
}
```

**Response Error (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Email ou mot de passe incorrect"
  }
}
```

#### POST /auth/logout
Déconnexion (invalider le token)

**Response (200):**
```json
{
  "success": true,
  "message": "Déconnexion réussie"
}
```

#### GET /auth/me
Informations utilisateur connecté

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@church.com",
    "first_name": "Jean",
    "last_name": "Dupont",
    "role": "mentor",
    "church_section": "Jeunes",
    "is_active": true
  }
}
```

### Gestion des Personnes

#### POST /persons
Enregistrer un nouveau visiteur

**Request:**
```json
{
  "first_name": "Marie",
  "last_name": "Martin",
  "gender": "F",
  "date_of_birth": "1990-05-15",
  "phone": "+33123456789",
  "email": "marie.martin@email.com",
  "address": "123 rue de la Paix",
  "commune": "Paris 15e",
  "quartier": "Grenelle",
  "profession": "Infirmière",
  "marital_status": "single",
  "first_visit_date": "2024-01-15",
  "how_heard_about_church": "Invitée par un ami",
  "prayer_requests": "Prière pour sa famille",
  "photo": "base64_encoded_image" // Optionnel
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "Marie",
    "last_name": "Martin",
    "status": "to_visit",
    "assigned_mentor_id": "uuid_auto_assigned",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### GET /persons
Liste des personnes avec filtres et pagination

**Query Parameters:**
- `page`: Numéro de page (défaut: 1)
- `limit`: Nombre d'éléments par page (défaut: 20, max: 100)
- `status`: Filtrer par statut (`to_visit`, `in_follow_up`, `integrated`, `to_redirect`, `long_absent`)
- `mentor_id`: Filtrer par mentor assigné
- `search`: Recherche dans nom/prénom
- `commune`: Filtrer par commune
- `date_from`: Date de première visite (format: YYYY-MM-DD)
- `date_to`: Date de première visite (format: YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "persons": [
      {
        "id": "uuid",
        "first_name": "Marie",
        "last_name": "Martin",
        "gender": "F",
        "phone": "+33123456789",
        "commune": "Paris 15e",
        "status": "to_visit",
        "assigned_mentor": {
          "id": "uuid",
          "first_name": "Jean",
          "last_name": "Dupont"
        },
        "first_visit_date": "2024-01-15",
        "last_interaction": "2024-01-20",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 98,
      "per_page": 20
    }
  }
}
```

#### GET /persons/{id}
Détails d'une personne

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "first_name": "Marie",
    "last_name": "Martin",
    "gender": "F",
    "date_of_birth": "1990-05-15",
    "phone": "+33123456789",
    "email": "marie.martin@email.com",
    "address": "123 rue de la Paix",
    "commune": "Paris 15e",
    "quartier": "Grenelle",
    "profession": "Infirmière",
    "marital_status": "single",
    "first_visit_date": "2024-01-15",
    "how_heard_about_church": "Invitée par un ami",
    "prayer_requests": "Prière pour sa famille",
    "photo_url": "https://storage.church/photos/uuid.jpg",
    "status": "in_follow_up",
    "assigned_mentor": {
      "id": "uuid",
      "first_name": "Jean",
      "last_name": "Dupont",
      "phone": "+33987654321",
      "church_section": "Jeunes"
    },
    "follow_ups": [
      {
        "id": "uuid",
        "interaction_date": "2024-01-20",
        "interaction_type": "call",
        "notes": "Premier contact téléphonique positif",
        "outcome": "positive",
        "mentor_name": "Jean Dupont"
      }
    ],
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-20T14:15:00Z"
  }
}
```

#### PUT /persons/{id}
Modifier les informations d'une personne

**Request:** (mêmes champs que POST, tous optionnels)
**Response:** (même format que GET /persons/{id})

#### PUT /persons/{id}/status
Changer le statut d'une personne

**Request:**
```json
{
  "status": "integrated",
  "notes": "Intégré dans la cellule jeunes"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "integrated",
    "updated_at": "2024-01-25T16:20:00Z"
  }
}
```

#### PUT /persons/{id}/assign-mentor
Assigner ou réassigner un mentor

**Request:**
```json
{
  "mentor_id": "uuid",
  "notes": "Réassignation pour proximité géographique"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "person_id": "uuid",
    "assigned_mentor": {
      "id": "uuid",
      "first_name": "Jean",
      "last_name": "Dupont"
    },
    "assigned_at": "2024-01-25T16:20:00Z"
  }
}
```

### Gestion des Suivis

#### POST /follow-ups
Enregistrer une interaction de suivi

**Request:**
```json
{
  "person_id": "uuid",
  "interaction_type": "visit",
  "interaction_date": "2024-01-25",
  "notes": "Visite à domicile réussie, famille accueillante",
  "outcome": "positive",
  "next_action_needed": true,
  "next_action_date": "2024-02-01",
  "next_action_notes": "Inviter à l'étude biblique"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "person_id": "uuid",
    "mentor_id": "uuid",
    "interaction_type": "visit",
    "interaction_date": "2024-01-25",
    "outcome": "positive",
    "created_at": "2024-01-25T18:30:00Z"
  }
}
```

#### GET /follow-ups
Liste des suivis avec filtres

**Query Parameters:**
- `person_id`: Filtrer par personne
- `mentor_id`: Filtrer par mentor
- `date_from`: Date de début (YYYY-MM-DD)
- `date_to`: Date de fin (YYYY-MM-DD)
- `outcome`: Filtrer par résultat
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "follow_ups": [
      {
        "id": "uuid",
        "person": {
          "id": "uuid",
          "first_name": "Marie",
          "last_name": "Martin"
        },
        "mentor": {
          "id": "uuid",
          "first_name": "Jean",
          "last_name": "Dupont"
        },
        "interaction_type": "visit",
        "interaction_date": "2024-01-25",
        "outcome": "positive",
        "next_action_date": "2024-02-01",
        "created_at": "2024-01-25T18:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 45
    }
  }
}
```

### Gestion des Utilisateurs

#### GET /users
Liste des utilisateurs (mentors, CAN, pasteurs)

**Query Parameters:**
- `role`: Filtrer par rôle
- `is_active`: Filtrer par statut actif
- `church_section`: Filtrer par section

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "first_name": "Jean",
        "last_name": "Dupont",
        "email": "jean.dupont@church.com",
        "role": "mentor",
        "church_section": "Jeunes",
        "assigned_persons_count": 5,
        "is_active": true
      }
    ]
  }
}
```

#### POST /users
Créer un nouvel utilisateur (admin seulement)

**Request:**
```json
{
  "email": "nouveau@church.com",
  "password": "password123",
  "first_name": "Pierre",
  "last_name": "Durant",
  "phone": "+33123456789",
  "role": "mentor",
  "church_section": "Adultes"
}
```

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "nouveau@church.com",
    "first_name": "Pierre",
    "last_name": "Durant",
    "role": "mentor",
    "created_at": "2024-01-25T10:00:00Z"
  }
}
```

### Statistiques et Rapports

#### GET /stats/dashboard
Statistiques générales pour le tableau de bord

**Query Parameters:**
- `period`: Période (`week`, `month`, `quarter`, `year`)
- `start_date`, `end_date`: Période personnalisée (YYYY-MM-DD)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "start_date": "2024-01-01",
    "end_date": "2024-01-31",
    "stats": {
      "new_visitors": 25,
      "total_persons": 150,
      "by_status": {
        "to_visit": 8,
        "in_follow_up": 12,
        "integrated": 3,
        "to_redirect": 1,
        "long_absent": 1
      },
      "by_commune": [
        {"commune": "Paris 15e", "count": 8},
        {"commune": "Paris 16e", "count": 6},
        {"commune": "Boulogne", "count": 4}
      ],
      "by_mentor": [
        {"mentor_name": "Jean Dupont", "assigned_count": 5, "integrated_count": 2},
        {"mentor_name": "Marie Claire", "assigned_count": 7, "integrated_count": 1}
      ],
      "integration_rate": 72.5,
      "active_mentors": 8
    }
  }
}
```

#### GET /stats/export
Export des données en Excel/CSV

**Query Parameters:**
- `format`: Format d'export (`excel`, `csv`)
- `type`: Type de données (`persons`, `follow_ups`, `stats`)
- `start_date`, `end_date`: Période (YYYY-MM-DD)
- `status`: Filtrer par statut (optionnel)

**Response Success (200):**
```json
{
  "success": true,
  "data": {
    "download_url": "https://api.ruachconnect.church/downloads/export_uuid.xlsx",
    "filename": "export_nouveaux_janvier_2024.xlsx",
    "expires_at": "2024-01-26T10:00:00Z"
  }
}
```

### Notifications

#### GET /notifications
Liste des notifications utilisateur

**Query Parameters:**
- `is_read`: Filtrer par statut lu/non lu
- `type`: Type de notification
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "uuid",
        "type": "follow_up_reminder",
        "title": "Suivi en attente",
        "message": "Marie Martin attend un suivi depuis 5 jours",
        "is_read": false,
        "action_url": "/persons/uuid",
        "created_at": "2024-01-25T09:00:00Z"
      }
    ],
    "unread_count": 3
  }
}
```

#### PUT /notifications/{id}/read
Marquer une notification comme lue

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_read": true,
    "read_at": "2024-01-25T16:30:00Z"
  }
}
```

### Upload de Fichiers

#### POST /upload/photo
Upload photo pour une personne

**Request:** (multipart/form-data)
- `file`: Fichier image (JPG, PNG, max 5MB)
- `person_id`: UUID de la personne

**Response Success (201):**
```json
{
  "success": true,
  "data": {
    "photo_url": "https://storage.church/photos/uuid.jpg",
    "file_size": 245760,
    "uploaded_at": "2024-01-25T16:45:00Z"
  }
}
```

## Authentification et Autorisation

### Types de Rôles
1. **can_committee**: Comité d'Accueil des Nouveaux
   - Accès complet aux nouveaux visiteurs
   - Peut assigner des mentors
   - Accès aux statistiques globales

2. **mentor**: Encadreur/Responsable de cellule
   - Accès aux personnes qui lui sont assignées
   - Peut créer/modifier les suivis
   - Statistiques de ses assignés uniquement

3. **pastor**: Pasteur
   - Accès lecture à toutes les données
   - Accès aux statistiques complètes
   - Peut réassigner les mentors

4. **admin**: Administrateur système
   - Accès complet à tous les endpoints
   - Gestion des utilisateurs
   - Configuration de l'application

### Permissions par Endpoint

| Endpoint | CAN | Mentor | Pastor | Admin |
|----------|-----|--------|--------|-------|
| POST /persons | ✅ | ❌ | ✅ | ✅ |
| GET /persons | ✅ | ✅* | ✅ | ✅ |
| PUT /persons/{id} | ✅ | ✅* | ✅ | ✅ |
| PUT /persons/{id}/assign-mentor | ✅ | ❌ | ✅ | ✅ |
| POST /follow-ups | ❌ | ✅ | ✅ | ✅ |
| GET /stats/dashboard | ✅ | ✅* | ✅ | ✅ |
| POST /users | ❌ | ❌ | ❌ | ✅ |

*\* Accès limité aux données qui leur sont assignées*

### JWT Token Structure
```json
{
  "sub": "user_uuid",
  "email": "user@church.com",
  "role": "mentor",
  "church_section": "Jeunes",
  "iat": 1642680000,
  "exp": 1642766400
}
```

## Gestion des Erreurs

### Codes d'Erreur Standards

#### 400 - Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Données invalides",
    "details": [
      {"field": "email", "message": "Format email invalide"},
      {"field": "phone", "message": "Numéro de téléphone requis"}
    ]
  }
}
```

#### 401 - Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Token d'authentification invalide ou expiré"
  }
}
```

#### 403 - Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Accès refusé pour ce rôle"
  }
}
```

#### 404 - Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Ressource non trouvée"
  }
}
```

#### 500 - Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Erreur interne du serveur"
  }
}
```

## Configuration et Déploiement

### Variables d'Environnement
```env
# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/ruachconnect
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=ruachconnect
DATABASE_USER=ruach_user
DATABASE_PASSWORD=secure_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_here
JWT_EXPIRES_IN=24h

# Upload de fichiers
UPLOAD_MAX_SIZE=5242880  # 5MB
UPLOAD_ALLOWED_TYPES=jpg,jpeg,png
STORAGE_PATH=/uploads/photos
STORAGE_URL=https://yourdomain.com/uploads

# Email (notifications futures)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@ruachconnect.church
SMTP_PASSWORD=email_password

# Application
APP_NAME=RuachConnect
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.ruachconnect.church
```

### Sécurité

#### Validation des Données
- **Email**: Format email valide
- **Téléphone**: Format international ou français
- **Dates**: Format ISO 8601 (YYYY-MM-DD)
- **UUIDs**: Format UUID valide v4
- **Photos**: Types MIME autorisés, taille max 5MB

#### Protection CORS
```json
{
  "origin": ["https://app.ruachconnect.church"],
  "methods": ["GET", "POST", "PUT", "DELETE"],
  "headers": ["Content-Type", "Authorization"],
  "credentials": true
}
```

#### Rate Limiting
- **Authentification**: 5 tentatives/15 minutes par IP
- **API générale**: 100 requêtes/minute par utilisateur
- **Upload**: 10 uploads/heure par utilisateur

## Migration et Données de Test

### Script de Migration Initial
```sql
-- Créer un utilisateur admin par défaut
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES 
('admin@ruach.church', '$hashed_password', 'Admin', 'System', 'admin');

-- Créer quelques mentors de test
INSERT INTO users (email, password_hash, first_name, last_name, role, church_section) VALUES 
('jean.dupont@ruach.church', '$hashed_password', 'Jean', 'Dupont', 'mentor', 'Jeunes'),
('marie.claire@ruach.church', '$hashed_password', 'Marie', 'Claire', 'mentor', 'Adultes');

-- Paramètres par défaut
INSERT INTO settings (key, value, description) VALUES
('reminder_days_new', '3', 'Rappel nouveau visiteur après X jours'),
('reminder_days_follow_up', '7', 'Rappel suivi régulier après X jours'),
('auto_assignment_enabled', 'true', 'Attribution automatique des mentors'),
('max_persons_per_mentor', '10', 'Nombre max de personnes par mentor');
```

## Intégrations Futures (Optionnelles)

### Notifications Push
- Service FCM (Firebase Cloud Messaging)
- Endpoint: POST /notifications/push
- Rappels automatiques pour suivis en attente

### Synchronisation Calendrier
- Export ICS des rendez-vous de suivi
- Intégration Google Calendar/Outlook

### Rapports Automatiques
- Génération automatique de rapports mensuels
- Email automatique aux responsables

## Notes d'Implémentation

### Règles Métier Importantes
1. **Attribution automatique**: Nouveau visiteur → mentor avec le moins de personnes assignées
2. **Notifications**: Rappel automatique après X jours sans interaction
3. **Statuts**: Progression logique: to_visit → in_follow_up → integrated
4. **Photos**: Redimensionnement automatique (max 800x800px)
5. **Soft delete**: Marquer comme inactif plutôt que supprimer

### Performance
- **Index**: Sur person.status, person.created_at, follow_ups.interaction_date
- **Cache**: Statistiques mises en cache 1h
- **Pagination**: Obligatoire pour toutes les listes (max 100 items)

### Monitoring
- **Logs**: Toutes les actions utilisateur
- **Métriques**: Nombre de nouveaux par jour/semaine
- **Health check**: Endpoint GET /health pour monitoring

Cette documentation fournit tous les éléments nécessaires pour développer le backend de l'application RuachConnect selon les spécifications du projet.