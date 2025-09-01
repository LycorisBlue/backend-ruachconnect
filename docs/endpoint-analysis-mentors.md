# Analyse Endpoint GET /users/mentors

## Vue d'ensemble
Endpoint permettant de récupérer la liste des mentors disponibles avec leur charge de travail actuelle pour faciliter l'attribution de nouveaux visiteurs.

## Flux de traitement

### 1. Route (routes/users.js:605-609)
```javascript
router.get('/mentors',
  authenticateToken,
  requireRole(['can_committee', 'pastor', 'admin']),
  UserController.getAvailableMentors
);
```

**Middleware appliqués:**
- `authenticateToken` - Vérification du token JWT
- `requireRole(['can_committee', 'pastor', 'admin'])` - Autorisation basée sur les rôles

### 2. Contrôleur (controllers/UserController.js:190-236)

#### Logique métier:
1. **Requête Prisma** - Récupération des mentors actifs avec leur charge
2. **Calcul de disponibilité** - Ajout des métadonnées de charge de travail
3. **Formatage de la réponse** - Structure standardisée

#### Détails de la requête Prisma:
```javascript
const mentors = await prisma.user.findMany({
  where: {
    role: Constants.USER_ROLES.MENTOR,
    isActive: true
  },
  select: {
    id: true,
    firstName: true,
    lastName: true,
    churchSection: true,
    _count: {
      select: {
        assignedPersons: {
          where: {
            status: {
              in: [Constants.PERSON_STATUS.TO_VISIT, Constants.PERSON_STATUS.IN_FOLLOW_UP]
            }
          }
        }
      }
    }
  },
  orderBy: [
    { churchSection: 'asc' },
    { lastName: 'asc' }
  ]
});
```

### 3. Base de données (Prisma Schema)

#### Tables impliquées:
- **users** - Table principale des mentors
- **persons** - Table des visiteurs pour comptage des assignations

#### Relations utilisées:
- `User.assignedPersons` (1:N) - Relation mentor → visiteurs assignés

#### Filtres appliqués:
- `role = 'mentor'` - Seuls les utilisateurs avec rôle mentor
- `isActive = true` - Uniquement les mentors actifs
- `status IN ('to_visit', 'in_follow_up')` - Comptage des visiteurs en cours de suivi

## Logique de calcul de charge

### Transformation des données:
```javascript
const mentorsWithLoad = mentors.map(mentor => ({
  ...mentor,
  currentLoad: mentor._count.assignedPersons,
  isAvailable: mentor._count.assignedPersons < Constants.DEFAULT_SETTINGS.MAX_PERSONS_PER_MENTOR
}));
```

### Paramètres de disponibilité:
- **MAX_PERSONS_PER_MENTOR**: 10 (défini dans utils/constants.js:67)
- **currentLoad**: Nombre de visiteurs actuellement assignés en statut `to_visit` ou `in_follow_up`
- **isAvailable**: `true` si currentLoad < 10, `false` sinon

## Structure de la réponse

### Format JSON:
```json
{
  "success": true,
  "message": "Liste des mentors récupérée",
  "data": {
    "mentors": [
      {
        "id": "uuid",
        "firstName": "string",
        "lastName": "string", 
        "churchSection": "string|null",
        "currentLoad": number,
        "isAvailable": boolean
      }
    ]
  }
}
```

### Tri appliqué:
1. **churchSection** (ASC) - Regroupement par section d'église
2. **lastName** (ASC) - Ordre alphabétique par nom de famille

## Cas d'usage

### Utilisation principale:
- Interface d'assignation de mentors dans l'app mobile
- Visualisation de la charge de travail des mentors
- Aide à la décision pour l'attribution automatique

### Permissions requises:
- **can_committee**: Peut assigner des mentors
- **pastor**: Supervision et réassignation
- **admin**: Gestion complète du système

## Points techniques

### Performance:
- Requête optimisée avec `select` spécifique
- Utilisation de `_count` pour éviter le chargement complet des relations
- Index implicite sur `role` et `isActive`

### Sécurité:
- Protection par JWT et rôles
- Pas d'exposition de données sensibles (pas de passwordHash)
- Validation des permissions avant exécution

### Robustesse:
- Gestion d'erreur avec try/catch
- Logging des erreurs pour debug
- Réponse standardisée via ApiResponse