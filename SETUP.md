# 🚀 Guide de Démarrage RuachConnect

## Prérequis
- **Node.js** 18.x ou supérieur
- **MySQL** 8.0 ou supérieur
- **npm** ou **yarn**

## Installation Rapide

### 1. Configuration Base de Données
```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE ruachconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

### 2. Configuration Application
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos paramètres MySQL
# DATABASE_URL="mysql://username:password@localhost:3306/ruachconnect"
```

### 3. Installation et Démarrage
```bash
# Installer les dépendances
npm install

# Synchroniser le schéma avec la base
npm run db:push

# Générer le client Prisma
npm run db:generate

# Alimenter avec les données de test
npm run db:seed

# Démarrer en mode développement
npm run dev
```

## 🔑 Comptes de Test Créés

| Rôle | Email | Mot de passe | Description |
|------|-------|--------------|-------------|
| **Admin** | `admin@ruach.church` | `admin123` | Administrateur système |
| **CAN** | `accueil1@ruach.church` | `user123` | Comité d'accueil |
| **CAN** | `accueil2@ruach.church` | `user123` | Comité d'accueil |
| **Mentor** | `mentor.jeunes@ruach.church` | `user123` | Responsable jeunes |
| **Mentor** | `mentor.adultes@ruach.church` | `user123` | Responsable adultes |
| **Mentor** | `mentor.femmes@ruach.church` | `user123` | Responsable femmes |
| **Mentor** | `mentor.hommes@ruach.church` | `user123` | Responsable hommes |
| **Pasteur** | `pasteur@ruach.church` | `user123` | Pasteur responsable |

## 📊 Données de Test Incluses
- **8 utilisateurs** avec rôles différents
- **4 visiteurs** avec statuts variés
- **4 suivis** d'exemple avec différents types d'interaction
- **3 notifications** de test
- **4 paramètres** système configurés

## 🧪 Test de l'API

### Authentification
```bash
# Test connexion admin
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ruach.church", "password": "admin123"}'

# Récupérer le token JWT retourné et l'utiliser pour les autres appels
```

### Endpoints de Base
```bash
# Health check
curl http://localhost:3000/health

# Info application
curl http://localhost:3000/info

# Liste des endpoints disponibles
curl http://localhost:3000/
```

### Test Complet Workflow
```bash
# 1. Connexion CAN
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "accueil1@ruach.church", "password": "user123"}'

# 2. Enregistrer nouveau visiteur (avec token JWT)
curl -X POST http://localhost:3000/api/v1/persons \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Visiteur",
    "gender": "M",
    "phone": "+225 01 00 00 00 00",
    "commune": "Cocody",
    "firstVisitDate": "2024-08-30",
    "howHeardAboutChurch": "Test API"
  }'

# 3. Liste des visiteurs
curl -X GET "http://localhost:3000/api/v1/persons?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev                    # Démarrage avec nodemon
npm run db:push               # Synchroniser schéma
npm run db:seed               # Réalimenter données test

# Base de données
npm run db:migrate            # Créer migration
npm run db:reset              # Reset complet + seed

# Production
npm start                     # Démarrage production
```

## 🚨 Résolution de Problèmes

### Erreur de Connexion MySQL
```bash
# Vérifier que MySQL est démarré
brew services start mysql     # macOS
sudo service mysql start      # Linux

# Tester la connexion
mysql -u root -p -e "SELECT 1;"
```

### Erreur Prisma
```bash
# Regénérer le client
npm run db:generate

# Reset et recréation
npm run db:reset
```

### Port déjà utilisé
```bash
# Changer le port dans .env
PORT=3001

# Ou tuer le processus sur le port 3000
lsof -ti:3000 | xargs kill
```

## 📱 Intégration Mobile

L'API est maintenant prête pour l'intégration avec l'application mobile Flutter selon les spécifications du cahier des charges.

**Base URL Développement :** `http://localhost:3000/api/v1`
**Base URL Production :** `https://api.ruachconnect.church/api/v1`