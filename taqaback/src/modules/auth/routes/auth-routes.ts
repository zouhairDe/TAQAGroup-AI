/**
 * Authentication Routes
 * Defines all authentication endpoints
 */

import { FastifyInstance } from 'fastify';
import { AuthHandler } from '../handlers/auth-handler';
import { AuthMiddleware } from '../middleware/auth-middleware';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('AuthRoutes');

export async function registerAuthRoutes(fastify: FastifyInstance) {
  // Login endpoint - Public
  fastify.post('/login', {
    schema: {
      description: 'Login user with email and password',
      tags: ['Authentication'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 1 }
        }
      },
      response: {
        200: {
          description: 'Login successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                    department: { type: 'string' },
                    isFirstLogin: { type: 'boolean' },
                    isActive: { type: 'boolean' }
                  }
                },
                token: { type: 'string' },
                requiresPasswordChange: { type: 'boolean' }
              }
            }
          }
        },
        400: {
          description: 'Bad request',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: AuthHandler.login
  });

  // Logout endpoint - No token verification required for logout
  fastify.post('/logout', {
    schema: {
      description: 'Logout current user',
      tags: ['Authentication'],
      response: {
        200: {
          description: 'Logout successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    handler: AuthHandler.logout
  });

  // Verify token endpoint - Protected
  fastify.get('/verify', {
    schema: {
      description: 'Verify current JWT token and get user data',
      tags: ['Authentication'],
      security: [{ Bearer: [] }],
      response: {
        200: {
          description: 'Token verification successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                    department: { type: 'string' },
                    isFirstLogin: { type: 'boolean' },
                    isActive: { type: 'boolean' }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    preHandler: AuthMiddleware.verifyToken,
    handler: AuthHandler.verifyToken
  });

  // Change password endpoint - Protected
  fastify.post('/change-password', {
    schema: {
      description: 'Change user password',
      tags: ['Authentication'],
      security: [{ Bearer: [] }],
      body: {
        type: 'object',
        required: ['newPassword'],
        properties: {
          newPassword: { type: 'string', minLength: 8 },
          currentPassword: { type: 'string' }
        }
      },
      response: {
        200: {
          description: 'Password change successful',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        400: {
          description: 'Bad request',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        403: {
          description: 'Forbidden',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    preHandler: AuthMiddleware.verifyToken,
    handler: AuthHandler.changePassword
  });

  // Get current user profile - Protected
  fastify.get('/profile', {
    schema: {
      description: 'Get current user profile',
      tags: ['Authentication'],
      security: [{ Bearer: [] }],
      response: {
        200: {
          description: 'Profile retrieved successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                user: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    email: { type: 'string' },
                    name: { type: 'string' },
                    role: { type: 'string' },
                    department: { type: 'string' },
                    isFirstLogin: { type: 'boolean' },
                    isActive: { type: 'boolean' }
                  }
                }
              }
            }
          }
        },
        401: {
          description: 'Unauthorized',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },
    preHandler: AuthMiddleware.verifyToken,
    handler: AuthHandler.getProfile
  });

  logger.info('Auth routes registered successfully');
} 