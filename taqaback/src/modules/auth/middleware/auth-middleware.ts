/**
 * Authentication Middleware
 * Verifies JWT tokens and protects routes
 */

import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface JWTPayload {
  id: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthMiddleware {
  /**
   * Middleware to verify JWT token
   */
  static async verifyToken(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    try {
      // Use Fastify's JWT verification
      await request.jwtVerify();

      // Extract user from the JWT payload
      const userPayload = request.user as JWTPayload;

      // Check if user still exists and is active
      const user = await prisma.user.findUnique({
        where: { id: userPayload.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          message: 'Utilisateur non trouvé',
        });
      }

      if (!user.isActive) {
        return reply.status(401).send({
          success: false,
          message: 'Compte désactivé',
        });
      }

      // User is already attached to request by Fastify JWT plugin

    } catch (error) {
      console.error('Auth middleware error:', error);
      return reply.status(401).send({
        success: false,
        message: 'Token invalide ou expiré',
      });
    }
  }
  /**
   * Middleware to check if user has admin role
   */
  static async requireAdmin(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userPayload = request.user as JWTPayload;

    if (!userPayload) {
      return reply.status(401).send({
        success: false,
        message: 'Non authentifié',
      });
    }

    if (userPayload.role !== 'admin') {
      return reply.status(403).send({
        success: false,
        message: 'Droits administrateur requis',
      });
    }
  }
  /**
   * Middleware to check if user has manager role or higher
   */
  static async requireManager(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userPayload = request.user as JWTPayload;

    if (!userPayload) {
      return reply.status(401).send({
        success: false,
        message: 'Non authentifié',
      });
    }

    if (!['admin', 'manager'].includes(userPayload.role)) {
      return reply.status(403).send({
        success: false,
        message: 'Droits de manager requis',
      });
    }
  }

  /**
   * Middleware to check if user has technician role or higher
   */
  static async requireTechnician(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userPayload = request.user as JWTPayload;

    if (!userPayload) {
      return reply.status(401).send({
        success: false,
        message: 'Non authentifié',
      });
    }

    if (!['admin', 'manager', 'technician'].includes(userPayload.role)) {
      return reply.status(403).send({
        success: false,
        message: 'Droits de technicien requis',
      });
    }
  }

  /**
   * Optional auth middleware - doesn't fail if no token provided
   */
  static async optionalAuth(
    request: FastifyRequest,
    _reply: FastifyReply
  ): Promise<void> {
    try {
      await request.jwtVerify();
    } catch (error) {
      // No token or invalid token, continue without auth
      return;
    }
  }
}