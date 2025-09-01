# ⛪ RuachConnect - Système de Recensement et Suivi

API backend pour le recensement, suivi et intégration des nouveaux visiteurs de l'église Ruach, développée pour optimiser l'accueil et l'accompagnement pastoral.

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21.2-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.15.0-indigo.svg)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

## 📋 Table des Matières

- [🏗️ Architecture du Projet](#️-architecture-du-projet)
- [📁 Structure des Dossiers](#-structure-des-dossiers)
- [⚙️ Configuration](#️-configuration)
- [🛡️ Middleware](#️-middleware)
- [🔄 Workflow de Développement](#-workflow-de-développement)
- [📊 Phases de Développement](#-phases-de-développement)
- [🚀 Guide de Démarrage](#-guide-de-démarrage)
- [📖 Documentation API](#-documentation-api)
- [🧪 Tests](#-tests)
- [🔧 Déploiement](#-déploiement)

---

## 🏗️ Architecture du Projet

### Stack Technique
- **Backend** : Node.js + Express.js
- **Base de données** : MySQL + Prisma ORM
- **Authentification** : JWT + rôles granulaires
- **Upload** : Multer + Sharp pour traitement d'images
- **Validation** : Express-validator + Middleware custom
- **Sécurité** : bcrypt + Rate limiting + Helmet

### Principes Architecturaux
- **Séparation des responsabilités** : Controllers → Services → Prisma
- **Validation en couches** : Validators → Business Logic → Database
- **Sécurité by design** : Authentification + autorisation granulaire
- **API RESTful** : Standards HTTP + codes de statut appropriés

---

## 📁 Structure des Dossiers

```
backend-ruachconnect/
├── 📁 bin/                     # Point d'entrée serveur
│   └── www                     # Serveur HTTP avec gestion multi-env
├── 📁 config/                  # Configuration centralisée
│   ├── app.js                 # Configuration application globale
│   ├── database.js            # Instance Prisma configurée
│   └── logger.js              # Configuration Winston logger
├── 📁 controllers/            # Logique métier et orchestration
│   ├── AuthController.js      # Authentification et gestion utilisateurs
│   ├── PersonController.js    # Gestion des nouveaux visiteurs
│   ├── FollowUpController.js  # Suivi et interactions
│   ├── UserController.js      # Administration des utilisateurs
│   └── StatsController.js     # Statistiques et rapports
├── 📁 middleware/             # Couches de validation et sécurité
│   ├── auth.js                # Authentification JWT + autorisation
│   ├── validation.js          # Gestion erreurs de validation
│   ├── errorHandler.js        # Gestion globale des erreurs
│   └── rateLimiter.js         # Limitation de taux de requêtes
├── 📁 prisma/                 # ORM et base de données
│   ├── schema.prisma          # Modèle de données complet
│   └── migrations/            # Évolutions de schéma
├── 📁 routes/                 # Endpoints spécialisés
│   ├── index.js               # Router principal
│   ├── auth.js                # Routes d'authentification
│   ├── persons.js             # Gestion des visiteurs
│   ├── follow-ups.js          # Historique des suivis
│   ├── users.js               # Administration utilisateurs
│   ├── stats.js               # Statistiques et exports
│   └── upload.js              # Upload de photos
├── 📁 services/               # Services métier et utilitaires
│   ├── AuthService.js         # Gestion JWT et authentification
│   ├── PersonService.js       # Logique métier visiteurs
│   ├── FollowUpService.js     # Logique métier suivi
│   ├── NotificationService.js # Système de notifications
│   ├── ExportService.js       # Génération rapports Excel/PDF
│   └── EmailService.js        # Envoi d'emails (optionnel)
├── 📁 validators/             # Schémas de validation
│   ├── authValidators.js      # Validation authentification
│   ├── personValidators.js    # Validation données visiteurs
│   ├── followUpValidators.js  # Validation interactions
│   └── userValidators.js      # Validation utilisateurs
├── 📁 utils/                  # Utilitaires et helpers
│   ├── constants.js           # Constantes globales
│   ├── helpers.js             # Fonctions utilitaires
│   └── apiResponse.js         # Réponses API standardisées
├── 📁 uploads/                # Stockage fichiers
│   └── photos/                # Photos des visiteurs
├── 📁 logs/                   # Fichiers de logs
├── 📁 public/                 # Assets statiques
├── app.js                     # Configuration Express principale
├── package.json               # Dépendances et scripts npm
└── .env                       # Variables d'environnement
```

### Rôle de Chaque Dossier

#### 📁 `config/` - Configuration Centralisée
- **`app.js`** : Configuration globale application (JWT, upload, email, etc.)
- **`database.js`** : Instance Prisma avec gestion connexion/santé
- **`logger.js`** : Configuration Winston pour logs structurés

#### 📁 `controllers/` - Orchestration Métier
- **`AuthController.js`** : Login, logout, gestion sessions, profils utilisateurs
- **`PersonController.js`** : CRUD visiteurs, attribution mentors, changements statuts
- **`FollowUpController.js`** : Enregistrement interactions, historique, actions futures
- **`UserController.js`** : Administration comptes (CAN, mentors, pasteurs)
- **`StatsController.js`** : Tableaux de bord, métriques, exports de données

#### 📁 `middleware/` - Couches Transversales
- **`auth.js`** : Vérification JWT + contrôle permissions par rôle
- **`validation.js`** : Traitement erreurs express-validator
- **`errorHandler.js`** : Gestion centralisée erreurs (Prisma, Multer, etc.)
- **`rateLimiter.js`** : Protection contre abus (auth, API, upload)

#### 📁 `services/` - Services Métier
- **`AuthService.js`** : Génération/vérification JWT, hash mots de passe
- **`PersonService.js`** : Logique métier visiteurs (auto-assignment, etc.)
- **`NotificationService.js`** : Alerts automatiques, rappels suivis
- **`ExportService.js`** : Génération Excel/PDF pour rapports

#### 📁 `validators/` - Validation de Données
- **Schémas express-validator** pour chaque domaine métier
- **Validation cohérente** et réutilisable
- **Messages d'erreur** en français

---

## ⚙️ Configuration

### 📄 `config/app.js` - Configuration Globale

```javascript
const config = {
  // Application
  app: {
    name: process.env.APP_NAME || 'RuachConnect',
    env: process.env.APP_ENV || 'development',
    debug: process.env.APP_DEBUG === 'true',
    url: process.env.APP_URL || 'http://localhost:3000',
    port: process.env.PORT || 3000
  },

  // Base de données MySQL
  database: {
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT) || 3306,
    name: process.env.DATABASE_NAME || 'ruachconnect',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD
  },

  // JWT Sécurisé
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '24h'
  },

  // Upload de Photos
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 5242880, // 5MB
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES?.split(',') || ['jpg', 'jpeg', 'png'],
    path: process.env.STORAGE_PATH || './uploads/photos',
    url: process.env.STORAGE_URL || 'http://localhost:3000/uploads'
  },

  // Rate Limiting par Contexte
  rateLimit: {
    auth: { windowMs: 15 * 60 * 1000, max: 5 },    // 5 tentatives/15min
    api: { windowMs: 60 * 1000, max: 100 },         // 100 req/minute
    upload: { windowMs: 60 * 60 * 1000, max: 10 }   // 10 uploads/heure
  }
};
```

### 📄 `config/database.js` - Gestion Base de Données

```javascript
const { PrismaClient } = require('@prisma/client');

class Database {
  constructor() {
    this.prisma = new PrismaClient({
      log: process.env.APP_ENV === 'development' ? 
           ['query', 'info', 'warn', 'error'] : ['error']
    });
  }

  async connect() {
    await this.prisma.$connect();
    // Logs de connexion
  }

  async healthCheck() {
    // Vérification santé base
    await this.prisma.$queryRaw`SELECT 1`;
  }
}
```

---

## 🛡️ Middleware

### 🔐 `auth.js` - Authentification & Autorisation

#### `authenticateToken()` - Vérification JWT
```javascript
const { authenticateToken } = require('./middleware/auth');

router.get('/profile', authenticateToken, (req, res) => {
  // req.user contient les données utilisateur
});
```

#### `requireRole(roles)` - Contrôle Permissions
```javascript
const { requireRole } = require('./middleware/auth');

// Un seul rôle
router.post('/persons', requireRole(['can_committee']));

// Plusieurs rôles autorisés
router.get('/stats', requireRole(['can_committee', 'pastor', 'admin']));
```

### ✅ `validation.js` - Gestion Erreurs de Validation

```javascript
const { body } = require('express-validator');
const { handleValidationErrors } = require('./middleware/validation');

router.post('/persons',
  [
    body('firstName').notEmpty().withMessage('Prénom requis'),
    body('email').isEmail().withMessage('Email invalide'),
    handleValidationErrors
  ],
  controller
);
```

### 🛡️ `rateLimiter.js` - Protection Anti-Abus

```javascript
const { authLimiter, apiLimiter, uploadLimiter } = require('./middleware/rateLimiter');

// Protection authentification
router.post('/auth/login', authLimiter, controller);

// Protection API générale
router.use('/api', apiLimiter);

// Protection uploads
router.post('/upload/photo', uploadLimiter, controller);
```

---

## 🔄 Workflow de Développement

### 📋 Processus Complet : Créer un Endpoint

#### Étape 1 : Définir la Validation
```javascript
// validators/personValidators.js
const { body, param, query } = require('express-validator');

const createPersonValidation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Prénom requis')
    .isLength({ min: 2, max: 100 })
    .withMessage('Prénom entre 2 et 100 caractères'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Nom requis'),
    
  body('gender')
    .isIn(['M', 'F'])
    .withMessage('Genre doit être M ou F'),
    
  body('email')
    .optional()
    .isEmail()
    .withMessage('Format email invalide'),
    
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Format téléphone invalide')
];

module.exports = { createPersonValidation };
```

#### Étape 2 : Créer le Service Métier
```javascript
// services/PersonService.js
const database = require('../config/database');

class PersonService {
  static async createPerson(data, createdBy) {
    const prisma = database.getClient();
    
    // Auto-assignment du mentor (règle métier)
    const mentor = await this.findAvailableMentor();
    
    const person = await prisma.person.create({
      data: {
        ...data,
        createdBy,
        assignedMentorId: mentor?.id,
        status: 'to_visit'
      },
      include: {
        assignedMentor: {
          select: { firstName: true, lastName: true }
        }
      }
    });

    // Créer notification pour le mentor
    if (mentor) {
      await NotificationService.createAssignmentNotification(mentor.id, person.id);
    }

    return person;
  }

  static async findAvailableMentor() {
    // Logique d'attribution automatique
    // Mentor avec le moins de personnes assignées
  }
}
```

#### Étape 3 : Créer le Controller
```javascript
// controllers/PersonController.js
const PersonService = require('../services/PersonService');
const ApiResponse = require('../utils/apiResponse');

class PersonController {
  static async createPerson(req, res) {
    try {
      const personData = req.body;
      const createdBy = req.user.id;
      
      const person = await PersonService.createPerson(personData, createdBy);
      
      return ApiResponse.created(res, 'Visiteur enregistré avec succès', {
        id: person.id,
        firstName: person.firstName,
        lastName: person.lastName,
        status: person.status,
        assignedMentor: person.assignedMentor
      });
    } catch (error) {
      console.error('Erreur création personne:', error);
      return ApiResponse.serverError(res, 'Erreur lors de l\'enregistrement');
    }
  }
}
```

#### Étape 4 : Créer la Route
```javascript
// routes/persons.js
const express = require('express');
const router = express.Router();

const PersonController = require('../controllers/PersonController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { createPersonValidation } = require('../validators/personValidators');

/**
 * POST /persons - Enregistrer un nouveau visiteur
 * Rôles autorisés: CAN Committee
 */
router.post('/',
  authenticateToken,
  requireRole(['can_committee']),
  createPersonValidation,
  handleValidationErrors,
  PersonController.createPerson
);

module.exports = router;
```

#### Étape 5 : Intégrer au Router Principal
```javascript
// routes/index.js
const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const personRoutes = require('./persons');
const followUpRoutes = require('./follow-ups');

router.use('/auth', authRoutes);
router.use('/persons', personRoutes);
router.use('/follow-ups', followUpRoutes);

module.exports = router;
```

### 📝 Conventions de Code

#### Nomenclature
- **Routes** : `kebab-case.js` (ex: `follow-ups.js`)
- **Controllers** : `PascalCase.js` (ex: `PersonController.js`)
- **Services** : `PascalCase.js` (ex: `PersonService.js`)
- **Méthodes** : `camelCase` (ex: `createPerson`)

#### Structure Réponses API
```javascript
// Succès
ApiResponse.success(res, message, data);
// {
//   "success": true,
//   "message": "...",
//   "data": {...}
// }

// Erreur
ApiResponse.badRequest(res, message);
// {
//   "success": false,
//   "error": {
//     "code": "VALIDATION_ERROR",
//     "message": "..."
//   }
// }
```

---

## 📊 Phases de Développement

### 🚀 Phase P1 - MVP Core (CRITIQUE)

**Objectif** : Fonctionnalités essentielles pour mise en production

#### Endpoints Prioritaires
1. **`POST /auth/login`** ✅ - Connexion utilisateurs
2. **`GET /auth/me`** ✅ - Profil utilisateur connecté
3. **`POST /persons`** - Enregistrement nouveaux visiteurs
4. **`GET /persons`** - Liste visiteurs avec filtres/pagination
5. **`GET /persons/{id}`** - Détails visiteur
6. **`PUT /persons/{id}`** - Modification informations visiteur
7. **`PUT /persons/{id}/status`** - Changement statut (à visiter → intégré)
8. **`POST /follow-ups`** - Enregistrement interaction de suivi

#### User Stories Couvertes
- **CAN** : Enregistrement visiteurs, attribution mentors
- **Mentors** : Consultation assignés, enregistrement suivis
- **Pasteurs** : Vue d'ensemble, réassignation mentors

#### Critères de Validation P1
- [ ] Authentification sécurisée fonctionnelle
- [ ] Enregistrement visiteurs avec photo optionnelle
- [ ] Attribution automatique mentors
- [ ] Système de suivi complet
- [ ] Changements de statuts trackés
- [ ] Pagination et filtres opérationnels

---

### 📈 Phase P2 - Administration et Statistiques (HAUTE)

**Objectif** : Outils de gestion et pilotage activité

#### Endpoints à Développer
9. **`POST /users`** - Création comptes utilisateurs (admin)
10. **`GET /users`** - Liste utilisateurs par rôle
11. **`PUT /users/{id}`** - Modification utilisateurs
12. **`PUT /persons/{id}/assign-mentor`** - Réassignation mentors
13. **`GET /stats/dashboard`** - Statistiques tableau de bord
14. **`GET /stats/export`** - Export Excel/PDF
15. **`GET /notifications`** - Notifications utilisateur
16. **`PUT /notifications/{id}/read`** - Marquer notification lue

#### User Stories Couvertes
- **Admins** : Gestion utilisateurs, configuration système
- **Responsables** : Statistiques détaillées, exports rapports
- **Tous** : Notifications automatiques, alertes personnalisées

---

### 🔔 Phase P3 - Notifications et Automatisation (MOYENNE)

**Objectif** : Automatisation du suivi et alertes proactives

#### Endpoints à Développer
17. **`POST /notifications/send`** - Envoi notification manuelle
18. **`GET /follow-ups/overdue`** - Suivis en retard
19. **`POST /reminders/schedule`** - Programmation rappels
20. **`GET /analytics/mentor-performance`** - Performance mentors
21. **`POST /bulk-actions/reassign`** - Réassignation en lot
22. **`GET /reports/integration-rate`** - Taux d'intégration détaillé

#### User Stories Couvertes
- **Système** : Rappels automatiques, détection abandons
- **Mentors** : Alertes personnalisées, aide au suivi
- **Pasteurs** : Analytics avancés, pilotage fin

---

### 📱 Phase P4 - Intégrations et Mobilité (BASSE)

**Objectif** : Extensions et connectivité externe

#### Endpoints à Développer
23. **`POST /integrations/calendar/export`** - Export calendrier ICS
24. **`POST /sms/send-bulk`** - SMS en masse (optionnel)
25. **`GET /mobile/sync/{timestamp}`** - Synchronisation hors-ligne
26. **`POST /webhooks/external`** - Intégrations externes
27. **`GET /api/health`** - Monitoring santé système

#### User Stories Couvertes
- **Mobile** : Synchronisation offline, performance optimisée
- **Intégrations** : Calendriers externes, outils tiers
- **Monitoring** : Santé système, métriques techniques

---

## 🚀 Guide de Démarrage

### Prérequis
- **Node.js** 18.x ou supérieur
- **MySQL** 8.0
- **npm** ou **yarn**

### Installation

```bash
# 1. Cloner le repository
git clone <repository-url>
cd backend-ruachconnect

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# 4. Configurer la base de données
npx prisma db push
npx prisma generate

# 5. (Optionnel) Alimenter avec des données de test
npm run db:seed

# 6. Démarrer en mode développement
npm run dev
```

### Variables d'Environnement Essentielles

```bash
# Base de données MySQL
DATABASE_URL="mysql://user:password@host:3306/ruachconnect"

# JWT Secret (générer une clé sécurisée)
JWT_SECRET="your_super_secure_jwt_secret_key_here"
JWT_EXPIRES_IN="24h"

# Upload de fichiers
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES="jpg,jpeg,png"
STORAGE_PATH="./uploads/photos"
STORAGE_URL="http://localhost:3000/uploads"

# Application
APP_NAME="RuachConnect"
APP_ENV="development"
APP_DEBUG="true"
APP_URL="http://localhost:3000"
PORT=3000

# Email (optionnel pour notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="noreply@ruach.church"
SMTP_PASSWORD="your_email_password"
```

### Scripts Disponibles

```bash
npm start              # Production (node)
npm run dev            # Développement (nodemon)
npm run db:push        # Synchroniser schéma avec DB
npm run db:generate    # Génération client Prisma
npm run db:migrate     # Créer migration
npm run db:seed        # Données de test
npm test               # Tests automatisés
```

---

## 📖 Documentation API

### Endpoints Principaux

#### Authentification
- `POST /auth/login` - Connexion utilisateur
- `POST /auth/logout` - Déconnexion sécurisée
- `GET /auth/me` - Profil utilisateur connecté

#### Gestion Visiteurs
- `POST /persons` - Enregistrement nouveau visiteur
- `GET /persons` - Liste avec filtres (statut, mentor, commune, dates)
- `GET /persons/{id}` - Détails visiteur avec historique
- `PUT /persons/{id}` - Modification informations
- `PUT /persons/{id}/status` - Changement statut
- `PUT /persons/{id}/assign-mentor` - Attribution/réassignation mentor

#### Suivi et Interactions
- `POST /follow-ups` - Enregistrement interaction
- `GET /follow-ups` - Historique avec filtres
- `GET /follow-ups/{id}` - Détails interaction

#### Administration
- `GET /users` - Liste utilisateurs par rôle
- `POST /users` - Création compte (admin uniquement)
- `GET /stats/dashboard` - Statistiques globales
- `GET /stats/export` - Export Excel/PDF

### Exemples de Requêtes

#### Enregistrement Visiteur
```bash
curl -X POST http://localhost:3000/persons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
```

#### Recherche Visiteurs
```bash
curl -X GET "http://localhost:3000/persons?status=to_visit&commune=Cocody&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Enregistrement Suivi
```bash
curl -X POST http://localhost:3000/follow-ups \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "personId": "uuid-person-id",
    "interactionType": "visit",
    "interactionDate": "2024-01-20",
    "notes": "Visite à domicile réussie, famille très accueillante",
    "outcome": "positive",
    "nextActionNeeded": true,
    "nextActionDate": "2024-01-27",
    "nextActionNotes": "Inviter à l étude biblique du mercredi"
  }'
```

---

## 🧪 Tests

### Structure des Tests
```
test/
├── integration/
│   ├── auth.test.js
│   ├── persons.test.js
│   └── follow-ups.test.js
├── unit/
│   ├── services/
│   └── utils/
└── fixtures/
    └── test-data.js
```

### Lancer les Tests
```bash
# Tous les tests
npm test

# Tests spécifiques
npm test -- --grep "auth"
npm test -- test/integration/persons.test.js

# Avec couverture
npm run test:coverage
```

---

## 🔧 Déploiement

### Environnements

#### Développement
- **Port** : 3000
- **Base** : MySQL locale
- **JWT** : Secret développement
- **Debug** : Activé

#### Production
- **Port** : 8080
- **Base** : MySQL production sécurisée
- **JWT** : Secret production robuste
- **Debug** : Désactivé
- **HTTPS** : Obligatoire

### Checklist Déploiement
```bash
# Préparer pour production
export NODE_ENV=production

# Variables d'environnement sécurisées
# - JWT_SECRET généré cryptographiquement
# - DATABASE_URL avec utilisateur dédié
# - SMTP configuré pour notifications

# Migrations production
npx prisma migrate deploy

# Démarrer avec PM2 ou Docker
npm start
```

---

## 🤝 Contribution

### Standards de Code
- **ESLint** : Configuration standard JavaScript
- **Prettier** : Formatage automatique
- **Commits** : Messages descriptifs en français

### Processus de Développement
1. **Branche** : Créer feature branch depuis `main`
2. **Développement** : Suivre workflow décrit ci-dessus
3. **Tests** : Ajouter tests unitaires et d'intégration
4. **PR** : Pull request avec description détaillée
5. **Review** : Validation par équipe technique
6. **Merge** : Après approbation et tests passants

### Contact et Support
- **Projet** : RuachConnect - Église Ruach
- **Architecture** : Voir structure dossiers détaillée ci-dessus
- **Issues** : Reporter via système de tickets Git

---

## 📄 Contexte Métier

### Utilisateurs Ciblés

#### 🎯 **CAN (Comité d'Accueil des Nouveaux)**
- **Rôle** : Recensement et première attribution
- **Permissions** : Création visiteurs, assignment mentors, statistiques
- **Workflow** : Accueil → Enregistrement → Attribution → Suivi initial

#### 🤝 **Mentors/Encadreurs**
- **Rôle** : Accompagnement personnalisé des visiteurs assignés
- **Permissions** : Consultation assignés, enregistrement interactions, mise à jour statuts
- **Workflow** : Réception assignment → Contact visiteur → Suivi régulier → Intégration

#### ⛪ **Pasteurs**
- **Rôle** : Vision d'ensemble et pilotage pastoral
- **Permissions** : Lecture toutes données, réassignation, statistiques complètes
- **Workflow** : Monitoring général → Interventions ciblées → Décisions stratégiques

#### ⚙️ **Administrateurs**
- **Rôle** : Configuration système et gestion utilisateurs
- **Permissions** : Toutes actions, gestion comptes, paramètres système
- **Workflow** : Maintenance → Configuration → Support utilisateurs

### Workflow Complet

```mermaid
graph TD
    A[Nouveau Visiteur] --> B[Enregistrement CAN]
    B --> C[Attribution Automatique Mentor]
    C --> D[Notification Mentor]
    D --> E[Premier Contact]
    E --> F[Suivi Régulier]
    F --> G{Résultat Suivi}
    G -->|Positif| H[Intégration Réussie]
    G -->|Difficultés| I[Réorientation/Réassignation]
    G -->|Pas de Contact| J[Statut Absent Prolongé]
    
    H --> K[Statistiques Succès]
    I --> L[Nouvelle Attribution]
    J --> M[Alerte Pasteur]
```

---

## 📄 Licence

**Propriété de l'Église Ruach** - Usage interne exclusif

---

*Documentation mise à jour le 30 août 2025*