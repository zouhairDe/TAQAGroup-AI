/**
 * Authentication Handler
 * Handles login, logout, token verification, and password management
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LoginRequest {
  email: string;
  password: string;
}

interface ChangePasswordRequest {
  newPassword: string;
  currentPassword?: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export class AuthHandler {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly JWT_EXPIRES_IN = '7d';

  /**
   * Login user with email and password
   */
  static async login(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const { email, password } = request.body as LoginRequest;

      // Validate input
      if (!email || !password) {
        return reply.status(400).send({
          success: false,
          message: 'Email et mot de passe requis',
        });
      }

      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        include: {
          profile: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Email ou mot de passe incorrect',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return reply.status(401).send({
          success: false,
          message: 'Compte désactivé. Contactez votre administrateur.',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return reply.status(401).send({
          success: false,
          message: 'Email ou mot de passe incorrect',
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        AuthHandler.JWT_SECRET,
        { expiresIn: AuthHandler.JWT_EXPIRES_IN }
      );

      // Update last login
      await prisma.userProfile.upsert({
        where: { userId: user.id },
        update: { lastLogin: new Date() },
        create: {
          userId: user.id,
          lastLogin: new Date(),
        },
      });

      // Prepare user data (exclude password)
      const userData = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.profile?.department,
        isFirstLogin: user.profile?.isFirstLogin ?? true,
        lastLogin: user.profile?.lastLogin,
        createdAt: user.createdAt,
        createdBy: user.profile?.createdBy,
        isActive: user.isActive,
      };

      return reply.send({
        success: true,
        message: 'Connexion réussie',
        data: {
          user: userData,
          token,
          requiresPasswordChange: user.profile?.isFirstLogin ?? true,
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erreur serveur lors de la connexion',
      });
    }
  }

  /**
   * Logout user (invalidate token on client side)
   */
  static async logout(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      // In a more advanced implementation, you might want to blacklist tokens
      // For now, we'll just return success as token invalidation happens on client side
      return reply.send({
        success: true,
        message: 'Déconnexion réussie',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erreur serveur lors de la déconnexion',
      });
    }
  }

  /**
   * Verify JWT token and return user data
   */
  static async verifyToken(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      // Token verification is handled by middleware
      // If we reach here, the token is valid
      const user = request.user;
      
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Token invalide',
        });
      }

      // Get fresh user data from database
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          profile: true,
        },
      });

      if (!userData || !userData.isActive) {
        return reply.status(401).send({
          success: false,
          message: 'Utilisateur non trouvé ou désactivé',
        });
      }

      // Prepare user data (exclude password)
      const responseData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.profile?.department,
        isFirstLogin: userData.profile?.isFirstLogin ?? true,
        lastLogin: userData.profile?.lastLogin,
        createdAt: userData.createdAt,
        createdBy: userData.profile?.createdBy,
        isActive: userData.isActive,
      };

      return reply.send({
        success: true,
        message: 'Token valide',
        data: {
          user: responseData,
        },
      });
    } catch (error) {
      console.error('Token verification error:', error);
      return reply.status(401).send({
        success: false,
        message: 'Token invalide',
      });
    }
  }

  /**
   * Change user password
   */
  static async changePassword(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      const { newPassword, currentPassword } = request.body as ChangePasswordRequest;
      const currentUser = request.user;

      if (!currentUser) {
        return reply.status(401).send({
          success: false,
          message: 'Non authentifié',
        });
      }

      // Validate input
      if (!newPassword) {
        return reply.status(400).send({
          success: false,
          message: 'Nouveau mot de passe requis',
        });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        include: { profile: true },
      });

      if (!user) {
        return reply.status(404).send({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // If not first login, verify current password
      if (!user.profile?.isFirstLogin) {
        if (!currentPassword) {
          return reply.status(400).send({
            success: false,
            message: 'Mot de passe actuel requis',
          });
        }

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          return reply.status(401).send({
            success: false,
            message: 'Mot de passe actuel incorrect',
          });
        }
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update password and mark first login as false
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          password: hashedPassword,
          updatedAt: new Date(),
        },
      });

      // Update profile to mark first login as false
      await prisma.userProfile.upsert({
        where: { userId: currentUser.id },
        update: { isFirstLogin: false },
        create: {
          userId: currentUser.id,
          isFirstLogin: false,
        },
      });

      return reply.send({
        success: true,
        message: 'Mot de passe mis à jour avec succès',
      });
    } catch (error) {
      console.error('Change password error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erreur serveur lors du changement de mot de passe',
      });
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(request: AuthenticatedRequest, reply: FastifyReply): Promise<void> {
    try {
      const user = request.user;
      
      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Non authentifié',
        });
      }

      // Get user data from database
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          profile: true,
        },
      });

      if (!userData) {
        return reply.status(404).send({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      // Prepare user data (exclude password)
      const responseData = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        department: userData.profile?.department,
        isFirstLogin: userData.profile?.isFirstLogin ?? true,
        lastLogin: userData.profile?.lastLogin,
        createdAt: userData.createdAt,
        createdBy: userData.profile?.createdBy,
        isActive: userData.isActive,
      };

      return reply.send({
        success: true,
        data: {
          user: responseData,
        },
      });
    } catch (error) {
      console.error('Get profile error:', error);
      return reply.status(500).send({
        success: false,
        message: 'Erreur serveur lors de la récupération du profil',
      });
    }
  }
} 