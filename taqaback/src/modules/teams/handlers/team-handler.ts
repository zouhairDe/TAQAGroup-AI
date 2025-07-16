import { FastifyRequest, FastifyReply } from 'fastify';
import { getDatabaseClient } from '../../../core/database/client';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('TeamHandler');
const prisma = getDatabaseClient();

// Request/Response interfaces
interface CreateTeamRequest {
  name: string;
  description?: string;
  type: 'maintenance' | 'operations' | 'engineering' | 'safety';
  leaderId: string;
  isActive?: boolean;
}

interface UpdateTeamRequest {
  name?: string;
  description?: string;
  type?: 'maintenance' | 'operations' | 'engineering' | 'safety';
  leaderId?: string;
  isActive?: boolean;
}

interface AddTeamMemberRequest {
  userId: string;
  role: string;
  skills?: string[];
}

interface GetTeamsQuery {
  page?: number;
  limit?: number;
  type?: string;
  isActive?: boolean;
  search?: string;
}

/**
 * Handler for team management endpoints
 */
export class TeamHandler {
  
  /**
   * Get all teams with filtering and pagination
   */
  async getAllTeams(
    request: FastifyRequest<{ Querystring: GetTeamsQuery }>, 
    reply: FastifyReply
  ) {
    try {
      const { page = 1, limit = 10, type, isActive, search } = request.query;
      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};
      if (type) where.type = type;
      if (isActive !== undefined) where.isActive = isActive;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get teams with members and leader
      const [teams, total] = await Promise.all([
        prisma.team.findMany({
          where,
          skip,
          take: limit,
                  include: {
          leader: true,
          members: true,
            _count: {
              select: {
                members: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.team.count({ where })
      ]);

      return {
        success: true,
        data: teams,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error getting teams:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve teams',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get team by ID
   */
  async getTeamById(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const team = await prisma.team.findUnique({
        where: { id },
        include: {
          leader: true,
          members: true
        }
      });

      if (!team) {
        reply.code(404);
        return {
          success: false,
          message: 'Team not found'
        };
      }

      return {
        success: true,
        data: team
      };
    } catch (error) {
      logger.error('Error getting team:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve team',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Create new team
   */
  async createTeam(
    request: FastifyRequest<{ Body: CreateTeamRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { name, leaderId, isActive = true } = request.body;

      // Check if leader exists
      const leader = await prisma.user.findUnique({
        where: { id: leaderId }
      });

      if (!leader) {
        reply.code(400);
        return {
          success: false,
          message: 'Team leader not found'
        };
      }

      // Create team
      const team = await prisma.team.create({
        data: {
          name,
          code: name.toLowerCase().replace(/\s+/g, '-'), // Generate code from name
          type: 'maintenance', // Default type
          specialties: [],
          location: 'Default Location',
          leader: { connect: { id: leaderId } },
          isActive
        },
        include: {
          leader: true
        }
      });

      return {
        success: true,
        message: 'Team created successfully',
        data: team
      };
    } catch (error) {
      logger.error('Error creating team:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to create team',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update team
   */
  async updateTeam(
    request: FastifyRequest<{ Params: { id: string }; Body: UpdateTeamRequest }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const updateData = request.body;

      // Check if team exists
      const existingTeam = await prisma.team.findUnique({
        where: { id }
      });

      if (!existingTeam) {
        reply.code(404);
        return {
          success: false,
          message: 'Team not found'
        };
      }

      // If updating leader, verify user exists
      if (updateData.leaderId) {
        const leader = await prisma.user.findUnique({
          where: { id: updateData.leaderId }
        });
        if (!leader) {
          reply.code(400);
          return {
            success: false,
            message: 'Team leader not found'
          };
        }
      }

      // Update team
      const team = await prisma.team.update({
        where: { id },
        data: updateData,
        include: {
          leader: true,
          members: true
        }
      });

      return {
        success: true,
        message: 'Team updated successfully',
        data: team
      };
    } catch (error) {
      logger.error('Error updating team:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to update team',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete team
   */
  async deleteTeam(
    request: FastifyRequest<{ Params: { id: string } }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      // Check if team exists
      const existingTeam = await prisma.team.findUnique({
        where: { id }
      });

      if (!existingTeam) {
        reply.code(404);
        return {
          success: false,
          message: 'Team not found'
        };
      }

      // Delete team (this will cascade to team members)
      await prisma.team.delete({
        where: { id }
      });

      return {
        success: true,
        message: 'Team deleted successfully'
      };
    } catch (error) {
      logger.error('Error deleting team:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to delete team',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add member to team
   */
  async addTeamMember(
    request: FastifyRequest<{ 
      Params: { id: string }; 
      Body: AddTeamMemberRequest 
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { userId, role, skills } = request.body;

      // Check if team exists
      const team = await prisma.team.findUnique({
        where: { id }
      });

      if (!team) {
        reply.code(404);
        return {
          success: false,
          message: 'Team not found'
        };
      }

      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        reply.code(400);
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Check if user is already a member
      const existingMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: id,
            userId: userId
          }
        }
      });

      if (existingMember) {
        reply.code(400);
        return {
          success: false,
          message: 'User is already a member of this team'
        };
      }

      // Add team member
      const teamMember = await prisma.teamMember.create({
        data: {
          teamId: id,
          userId,
          role,
          skills: skills || []
        },
        include: {
          team: true
        }
      });

      return {
        success: true,
        message: 'Team member added successfully',
        data: teamMember
      };
    } catch (error) {
      logger.error('Error adding team member:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to add team member',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Remove member from team
   */
  async removeTeamMember(
    request: FastifyRequest<{ 
      Params: { id: string; userId: string } 
    }>, 
    reply: FastifyReply
  ) {
    try {
      const { id, userId } = request.params;

      // Check if team member exists
      const teamMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: {
            teamId: id,
            userId: userId
          }
        }
      });

      if (!teamMember) {
        reply.code(404);
        return {
          success: false,
          message: 'Team member not found'
        };
      }

      // Remove team member
      await prisma.teamMember.delete({
        where: {
          teamId_userId: {
            teamId: id,
            userId: userId
          }
        }
      });

      return {
        success: true,
        message: 'Team member removed successfully'
      };
    } catch (error) {
      logger.error('Error removing team member:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to remove team member',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get team statistics
   */
  async getTeamStats(
    _request: FastifyRequest, 
    reply: FastifyReply
  ) {
    try {
      const [
        totalTeams,
        activeTeams,
        teamsByType,
        teamMemberCounts
      ] = await Promise.all([
        prisma.team.count(),
        prisma.team.count({ where: { isActive: true } }),
        prisma.team.groupBy({
          by: ['type'],
          _count: { type: true }
        }),
        prisma.team.findMany({
          include: {
            _count: {
              select: {
                members: true
              }
            }
          }
        })
      ]);

      const averageTeamSize = teamMemberCounts.length > 0 
        ? teamMemberCounts.reduce((sum, team) => sum + team._count.members, 0) / teamMemberCounts.length
        : 0;

      return {
        success: true,
        data: {
          totalTeams,
          activeTeams,
          inactiveTeams: totalTeams - activeTeams,
          typeDistribution: teamsByType.reduce((acc, item) => {
            acc[item.type] = item._count.type;
            return acc;
          }, {} as Record<string, number>),
          averageTeamSize: Math.round(averageTeamSize * 10) / 10,
          totalMembers: teamMemberCounts.reduce((sum, team) => sum + team._count.members, 0)
        }
      };
    } catch (error) {
      logger.error('Error getting team stats:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to retrieve team statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 