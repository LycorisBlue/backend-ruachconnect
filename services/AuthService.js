const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/app');
const database = require('../config/database');
const Constants = require('../utils/constants');

class AuthService {
  /**
   * Génération token JWT
   */
  static generateToken(user) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      church_section: user.churchSection,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * Vérification token JWT
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Token invalide');
    }
  }

  /**
   * Hash du mot de passe
   */
  static async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Vérification mot de passe
   */
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  /**
   * Connexion utilisateur
   */
  static async login(email, password) {
    const prisma = database.getClient();
    
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        passwordHash: true,
        firstName: true,
        lastName: true,
        role: true,
        churchSection: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      throw new Error('Utilisateur non trouvé ou inactif');
    }

    const isPasswordValid = await this.verifyPassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Mot de passe incorrect');
    }

    const token = this.generateToken(user);
    
    // Retourner user sans le hash du mot de passe
    const { passwordHash, ...userWithoutPassword } = user;
    
    return {
      token,
      user: userWithoutPassword
    };
  }

  /**
   * Création utilisateur
   */
  static async createUser(userData) {
    const prisma = database.getClient();
    
    const hashedPassword = await this.hashPassword(userData.password);
    
    const user = await prisma.user.create({
      data: {
        email: userData.email.toLowerCase(),
        passwordHash: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        role: userData.role,
        churchSection: userData.churchSection
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        churchSection: true,
        isActive: true,
        createdAt: true
      }
    });

    return user;
  }

  /**
   * Récupération utilisateur par ID
   */
  static async getUserById(userId) {
    const prisma = database.getClient();
    
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        churchSection: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    });
  }

  /**
   * Vérification permissions
   */
  static hasPermission(userRole, requiredRoles) {
    return requiredRoles.includes(userRole);
  }

  /**
   * Génération mot de passe temporaire
   */
  static generateTemporaryPassword(length = 8) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}

module.exports = AuthService;