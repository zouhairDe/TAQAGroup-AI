import { FastifyRequest, FastifyReply } from 'fastify';
import { getDatabaseClient } from '../../../core/database/client';
import bcrypt from 'bcrypt';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('UserHandler');
const prisma = getDatabaseClient();

// Request/Response interfaces
interface CreateUserRequest {
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'technician';
  password: string;
  isActive?: boolean;
}

interface CreateUserByManagerRequest {
  email: string;
  fullName: string;
  role: 'admin' | 'manager' | 'technician';
  password: string;
  phoneNumber?: string;
  department: string;
  site: string;
  createdBy: string; // User ID of the manager/admin creating the user
  isActive?: boolean;
}

interface UpdateUserRequest {
  name?: string;
  role?: 'admin' | 'manager' | 'technician';
  isActive?: boolean;
}

// interface UserResponse {
//   id: string;
//   email: string;
//   name: string;
//   role: string;
//   isActive: boolean;
//   createdAt: Date;
//   updatedAt: Date;
// }

interface GetUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  site?: string;
  isActive?: boolean;
  search?: string;
}

interface UpdateProfileRequest {
  name?: string;
  phone?: string;
}

interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Handler for user management endpoints
 */
export class UserHandler {
  
  /**
   * Get all users with filtering and pagination
   */
  async getAllUsers(
    request: FastifyRequest<{ Querystring: GetUsersQuery }>, 
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, role, site, isActive, search } = request.query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (role) where.role = role;
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get users with profile information
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          include: {
            profile: true
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.user.count({ where })
      ]);

      // Filter by site if specified (from profile)
      let filteredUsers = users;
      if (site) {
        filteredUsers = users.filter(user => user.profile?.site === site);
      }

      return {
        success: true,
        data: filteredUsers.map(user => ({
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: user.profile
        })),
        meta: {
          page,
          limit,
          total: site ? filteredUsers.length : total,
          totalPages: Math.ceil((site ? filteredUsers.length : total) / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting users:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true
        }
      });

      if (!user) {
        reply.code(404);
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: user.profile
        }
      };
    } catch (error) {
      logger.error('Error getting user:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new user
   */
  async createUser(
    request: FastifyRequest<{ Body: CreateUserRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { email, name, role, password, isActive = true } = request.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        reply.code(400);
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          name,
          role,
          password: hashedPassword,
          isActive
        }
      });

      return {
        success: true,
        message: 'User created successfully',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      logger.error('Error creating user:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update user
   */
  async updateUser(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateUserRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        reply.code(404);
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Update user
      const user = await prisma.user.update({
        where: { id },
        data: updateData
      });

      return {
        success: true,
        message: 'User updated successfully',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      };
    } catch (error) {
      logger.error('Error updating user:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete user
   */
  async deleteUser(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        reply.code(404);
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Delete user (this will cascade to profile)
      await prisma.user.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting user:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const [totalUsers, activeUsers, usersByRole, usersBySite] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { isActive: true } }),
        prisma.user.groupBy({
          by: ['role'],
          _count: { role: true }
        }),
        prisma.userProfile.groupBy({
          by: ['site'],
          _count: { site: true },
          where: { site: { not: null } }
        })
      ]);

      return {
        success: true,
        data: {
          totalUsers,
          activeUsers,
          inactiveUsers: totalUsers - activeUsers,
          roleDistribution: usersByRole.reduce((acc, item) => {
            acc[item.role] = item._count.role;
            return acc;
          }, {} as Record<string, number>),
          siteDistribution: usersBySite.reduce((acc, item) => {
            if (item.site) {
              acc[item.site] = item._count.site;
            }
            return acc;
          }, {} as Record<string, number>)
        }
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve user statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get available departments for user creation
   */
  async getAvailableDepartments(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const departments = await prisma.department.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          code: true,
          description: true
        },
        orderBy: { name: 'asc' }
      });

      return {
        success: true,
        data: departments
      };
    } catch (error) {
      logger.error('Error getting departments:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve departments',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get available sites for user creation
   */
  async getAvailableSites(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const sites = await prisma.site.findMany({
        where: { status: 'operational' },
        select: {
          id: true,
          name: true,
          code: true,
          location: true,
          status: true
        },
        orderBy: { name: 'asc' }
      });

      return {
        success: true,
        data: sites
      };
    } catch (error) {
      logger.error('Error getting sites:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve sites',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new user by manager/admin (with full profile)
   */
  async createUserByManager(
    request: FastifyRequest<{ Body: CreateUserByManagerRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { 
        email, 
        fullName, 
        role, 
        password, 
        phoneNumber, 
        department, 
        site, 
        createdBy,
        isActive = true 
      } = request.body;

      // Validate that the creator exists and has proper role
      const creator = await prisma.user.findUnique({
        where: { id: createdBy },
        select: { id: true, role: true, isActive: true }
      });

      if (!creator) {
        reply.code(400);
        return {
          success: false,
          message: 'Creator user not found'
        };
      }

      if (!creator.isActive) {
        reply.code(400);
        return {
          success: false,
          message: 'Creator user is not active'
        };
      }

      // Validate creator has proper permissions (admin or manager)
      if (!['admin', 'manager'].includes(creator.role)) {
        reply.code(403);
        return {
          success: false,
          message: 'Only administrators and managers can create users'
        };
      }

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        reply.code(400);
        return {
          success: false,
          message: 'User with this email already exists'
        };
      }

      // Validate department exists
      const departmentExists = await prisma.department.findUnique({
        where: { code: department }
      });

      if (!departmentExists) {
        reply.code(400);
        return {
          success: false,
          message: 'Department not found'
        };
      }

      // Validate site exists
      const siteExists = await prisma.site.findUnique({
        where: { code: site }
      });

      if (!siteExists) {
        reply.code(400);
        return {
          success: false,
          message: 'Site not found'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user with profile in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create user
        const user = await tx.user.create({
          data: {
            email,
            name: fullName,
            role,
            password: hashedPassword,
            isActive
          }
        });

        // Create user profile
        const profile = await tx.userProfile.create({
          data: {
            userId: user.id,
            department,
            site,
            phone: phoneNumber || null,
            createdBy,
            isFirstLogin: true
          }
        });

        return { user, profile };
      });

      logger.info(`User created by manager/admin: ${result.user.email} by ${creator.id}`);

      return {
        success: true,
        message: 'User created successfully',
        data: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          isActive: result.user.isActive,
          createdAt: result.user.createdAt,
          updatedAt: result.user.updatedAt,
          profile: {
            id: result.profile.id,
            department: result.profile.department,
            site: result.profile.site,
            phone: result.profile.phone,
            createdBy: result.profile.createdBy,
            isFirstLogin: result.profile.isFirstLogin
          }
        }
      };
    } catch (error) {
      logger.error('Error creating user by manager:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current user's profile
   */
  async getCurrentUserProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      // Get user ID from auth token
      const userId = request.user?.id;
      if (!userId) {
        reply.code(401);
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      // Get user with profile
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true
        }
      });

      if (!user) {
        reply.code(404);
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          department: user.profile?.department || null,
          site: user.profile?.site || null,
          phone: user.profile?.phone || null,
          lastLogin: user.profile?.lastLogin || null
        }
      };
    } catch (error) {
      logger.error('Error getting user profile:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update current user's profile
   */
  async updateCurrentUserProfile(
    request: AuthenticatedRequest & { Body: UpdateProfileRequest },
    reply: FastifyReply
  ) {
    try {
      // Get user ID from auth token
      const userId = request.user?.id;
      if (!userId) {
        reply.code(401);
        return {
          success: false,
          message: 'Not authenticated'
        };
      }

      const { name, phone } = request.body;

      // Update user and profile in transaction
      const updatedUser = await prisma.$transaction(async (tx) => {
        // Update user
        const user = await tx.user.update({
          where: { id: userId },
          data: {
            name: name || undefined,
          },
          include: {
            profile: true
          }
        });

        // Update or create profile
        const profile = await tx.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            phone: phone || null
          },
          update: {
            phone: phone || undefined
          }
        });

        return { ...user, profile };
      });

      return {
        success: true,
        data: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          role: updatedUser.role,
          isActive: updatedUser.isActive,
          createdAt: updatedUser.createdAt,
          updatedAt: updatedUser.updatedAt,
          department: updatedUser.profile?.department || null,
          site: updatedUser.profile?.site || null,
          phone: updatedUser.profile?.phone || null,
          lastLogin: updatedUser.profile?.lastLogin || null
        }
      };
    } catch (error) {
      logger.error('Error updating user profile:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to update user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 