# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RuachConnect is a church visitor management system built with Node.js/Express and MySQL. It's designed to help church staff track new visitors, assign mentors, and manage follow-up interactions through a RESTful API that powers a Flutter mobile app.

## Development Commands

### Database Operations
- `npm run db:push` - Sync Prisma schema with database (development)
- `npm run db:migrate` - Create and apply database migrations
- `npm run db:generate` - Generate Prisma client after schema changes
- `npm run db:seed` - Populate database with test data
- `npm run db:reset` - Reset database and re-seed (development only)

### Application
- `npm run dev` - Start development server with nodemon (port 3000)
- `npm start` - Start production server
- `npm run lint` - Currently not configured
- `npm test` - Currently not configured

### Development Workflow
1. Make schema changes in `prisma/schema.prisma`
2. Run `npm run db:push` to sync changes
3. Run `npm run db:generate` to update Prisma client
4. Test with `npm run dev`

## Architecture

### Tech Stack
- **Backend**: Node.js + Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **File Upload**: Multer + Sharp for image processing
- **Security**: bcryptjs, Helmet, CORS, rate limiting

### Project Structure

#### Core Layers
- **Routes** (`routes/`) - HTTP endpoints and request routing
- **Controllers** (`controllers/`) - Business logic orchestration  
- **Services** (`services/`) - Domain logic and data processing
- **Middleware** (`middleware/`) - Authentication, validation, error handling
- **Configuration** (`config/`) - App config, database, logging

#### Data Layer
- **Prisma Schema** (`prisma/schema.prisma`) - Database models and relationships
- **Validators** (`validators/`) - Express-validator schemas for input validation
- **Utils** (`utils/`) - Helper functions and constants

### API Structure
Base URL: `/api/v1/`

Main endpoints:
- `/auth/*` - Authentication (login, logout, profile)
- `/persons/*` - Visitor management (CRUD, status changes, mentor assignment)
- `/follow-ups/*` - Interaction tracking and follow-up history
- `/users/*` - User management (admin operations)
- `/stats/*` - Statistics and reporting
- `/notifications/*` - Notification system
- `/upload/*` - File uploads (photos)

### User Roles & Permissions
1. **can_committee** - Can create visitors, assign mentors, view statistics
2. **mentor** - Can view assigned persons, create follow-ups, update status
3. **pastor** - Read access to all data, can reassign mentors, full statistics
4. **admin** - Full system access, user management, configuration

### Key Business Rules
- New visitors automatically assigned to mentors based on workload
- Status progression: `to_visit` → `in_follow_up` → `integrated`
- Follow-ups tracked with outcomes and next action planning
- Notifications generated for overdue follow-ups and new assignments

## Database Schema

### Core Models
- **User** - System users (CAN, mentors, pastors, admins)
- **Person** - Church visitors with demographic and spiritual info
- **FollowUp** - Interaction history between mentors and visitors
- **Notification** - System notifications and reminders
- **Setting** - Application configuration values

### Key Relationships
- User 1:N Person (as assigned mentor)
- User 1:N Person (as creator)
- Person 1:N FollowUp
- User 1:N FollowUp (as mentor)
- User 1:N Notification

## Configuration

### Environment Variables (.env)
```bash
# Database
DATABASE_URL="mysql://user:password@localhost:3306/ruachconnect"

# JWT Authentication
JWT_SECRET="your_secure_secret_key"
JWT_EXPIRES_IN="24h"

# File Upload
UPLOAD_MAX_SIZE=5242880  # 5MB
STORAGE_PATH="./uploads/photos"

# Application
APP_ENV="development"
PORT=3000
```

### Key Configuration Files
- `config/app.js` - Centralized configuration management
- `config/database.js` - Prisma client setup and health checks  
- `config/logger.js` - Winston logging configuration

## Security Features

### Authentication & Authorization
- JWT token-based authentication
- Role-based access control with granular permissions
- Password hashing with bcryptjs
- Token validation middleware for protected routes

### Rate Limiting
- Auth endpoints: 5 attempts per 15 minutes
- General API: 100 requests per minute
- File uploads: 10 uploads per hour

### Data Validation
- Express-validator for input validation
- Prisma schema validation at database level
- File type and size validation for uploads

## Development Practices

### Error Handling
- Centralized error handling middleware
- Structured error responses with appropriate HTTP status codes
- Comprehensive logging with Winston

### Code Organization
- Controllers handle HTTP concerns and orchestrate business logic
- Services contain domain logic and complex operations
- Separation between validation, business logic, and data access
- Consistent API response format throughout application

### Testing & Debugging
- Health check endpoint at `/health` for monitoring
- Structured logging in development vs production modes
- Database health checks included in health endpoint

## Production Considerations

### Database Migrations
- Use `npm run db:migrate` for production schema changes
- Never use `db:push` in production
- Test migrations thoroughly in staging environment

### Security Hardening
- Helmet.js for security headers
- CORS configured for production domains
- Rate limiting to prevent abuse
- Input validation on all endpoints

### Monitoring
- Winston logging with appropriate log levels
- Health endpoint for external monitoring
- Database connection health tracking