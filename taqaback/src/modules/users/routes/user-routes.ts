import { FastifyInstance } from 'fastify';
import { UserHandler } from '../handlers/user-handler';
import { createLogger } from '../../../core/utils/logger';
import { AuthMiddleware } from '../../auth/middleware/auth-middleware';

const logger = createLogger('UserRoutes');

// Route parameter types
interface ProfileUpdateBody {
  name?: string;
  phone?: string;
}

/**
 * Register user management routes
 */
export async function registerUserRoutes(server: FastifyInstance): Promise<void> {
  const userHandler = new UserHandler();

  // Get current user's profile
  server.get('/profile', {
    onRequest: [AuthMiddleware.verifyToken],
    schema: {
      description: 'Get current user profile',
      tags: ['Users'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                department: { type: 'string', nullable: true },
                site: { type: 'string', nullable: true },
                phone: { type: 'string', nullable: true },
                lastLogin: { type: 'string', nullable: true }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.getCurrentUserProfile.bind(userHandler));

  // Update current user's profile
  server.put<{ Body: ProfileUpdateBody }>('/profile', {
    onRequest: [AuthMiddleware.verifyToken],
    schema: {
      description: 'Update current user profile',
      tags: ['Users'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          phone: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                department: { type: 'string', nullable: true },
                site: { type: 'string', nullable: true },
                phone: { type: 'string', nullable: true },
                lastLogin: { type: 'string', nullable: true }
              }
            }
          }
        },
        401: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.updateCurrentUserProfile.bind(userHandler));

  // Get all users with filtering and pagination
  server.get('/', {
    schema: {
      description: 'Get all users with filtering and pagination',
      tags: ['Users'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          role: { type: 'string', enum: ['admin', 'manager', 'technician'] },
          site: { type: 'string' },
          isActive: { type: 'boolean' },
          search: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  email: { type: 'string' },
                  name: { type: 'string' },
                  role: { type: 'string' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string' },
                  updatedAt: { type: 'string' },
                  profile: { type: 'object', nullable: true }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'number' },
                limit: { type: 'number' },
                total: { type: 'number' },
                totalPages: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, userHandler.getAllUsers.bind(userHandler));

  // Get user by ID
  server.get('/:id', {
    schema: {
      description: 'Get user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                profile: { type: 'object', nullable: true }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.getUserById.bind(userHandler));

  // Create new user
  server.post('/', {
    schema: {
      description: 'Create a new user',
      tags: ['Users'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          name: { type: 'string', minLength: 2 },
          role: { type: 'string', enum: ['admin', 'manager', 'technician'] },
          password: { type: 'string', minLength: 8 },
          isActive: { type: 'boolean', default: true }
        },
        required: ['email', 'name', 'role', 'password']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.createUser.bind(userHandler));

  // Create new user by manager/admin (with full profile)
  server.post('/create-by-manager', {
    schema: {
      description: 'Create a new user by manager/admin with full profile information',
      tags: ['Users', 'Admin'],
      body: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          fullName: { type: 'string', minLength: 2 },
          role: { type: 'string', enum: ['admin', 'manager', 'technician'] },
          password: { type: 'string', minLength: 8 },
          phoneNumber: { type: 'string' },
          department: { type: 'string', minLength: 1 },
          site: { type: 'string', minLength: 1 },
          createdBy: { type: 'string', minLength: 1 },
          isActive: { type: 'boolean', default: true }
        },
        required: ['email', 'fullName', 'role', 'password', 'department', 'site', 'createdBy']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' },
                profile: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    department: { type: 'string' },
                    site: { type: 'string' },
                    phone: { type: 'string' },
                    createdBy: { type: 'string' },
                    isFirstLogin: { type: 'boolean' }
                  }
                }
              }
            }
          }
        },
        400: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        403: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.createUserByManager.bind(userHandler));

  // Update user
  server.put('/:id', {
    schema: {
      description: 'Update user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          role: { type: 'string', enum: ['admin', 'manager', 'technician'] },
          isActive: { type: 'boolean' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                name: { type: 'string' },
                role: { type: 'string' },
                isActive: { type: 'boolean' },
                createdAt: { type: 'string' },
                updatedAt: { type: 'string' }
              }
            }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.updateUser.bind(userHandler));

  // Delete user
  server.delete('/:id', {
    schema: {
      description: 'Delete user by ID',
      tags: ['Users'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        },
        404: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, userHandler.deleteUser.bind(userHandler));

  // Get user statistics
  server.get('/stats/overview', {
    schema: {
      description: 'Get user statistics overview',
      tags: ['Users']
    }
  }, userHandler.getUserStats.bind(userHandler));

  // Get departments
  server.get('/departments', {
    schema: {
      description: 'Get all departments',
      tags: ['Users']
    }
  }, userHandler.getAvailableDepartments.bind(userHandler));

  // Get sites
  server.get('/sites', {
    schema: {
      description: 'Get all sites',
      tags: ['Users']
    }
  }, userHandler.getAvailableSites.bind(userHandler));

  logger.info('User routes registered successfully');
} 