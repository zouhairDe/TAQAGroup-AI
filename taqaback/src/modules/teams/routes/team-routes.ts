import { FastifyInstance } from 'fastify';
import { TeamHandler } from '../handlers/team-handler';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('TeamRoutes');

/**
 * Register team management routes
 */
export async function registerTeamRoutes(server: FastifyInstance): Promise<void> {
  const teamHandler = new TeamHandler();

  // Get all teams with filtering and pagination
  server.get('/', {
    schema: {
      description: 'Get all teams with filtering and pagination',
      tags: ['Teams'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          type: { type: 'string', enum: ['maintenance', 'operations', 'engineering', 'safety'] },
          isActive: { type: 'boolean' },
          search: { type: 'string' }
        }
      }
    }
  }, teamHandler.getAllTeams.bind(teamHandler));

  // Get team statistics
  server.get('/stats/overview', {
    schema: {
      description: 'Get team statistics overview',
      tags: ['Teams']
    }
  }, teamHandler.getTeamStats.bind(teamHandler));

  // Get team by ID
  server.get('/:id', {
    schema: {
      description: 'Get team by ID',
      tags: ['Teams'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, teamHandler.getTeamById.bind(teamHandler));

  // Create new team
  server.post('/', {
    schema: {
      description: 'Create a new team',
      tags: ['Teams'],
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          description: { type: 'string' },
          type: { type: 'string', enum: ['maintenance', 'operations', 'engineering', 'safety'] },
          leaderId: { type: 'string' },
          isActive: { type: 'boolean', default: true }
        },
        required: ['name', 'type', 'leaderId']
      }
    }
  }, teamHandler.createTeam.bind(teamHandler));

  // Update team
  server.put('/:id', {
    schema: {
      description: 'Update team by ID',
      tags: ['Teams'],
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
          description: { type: 'string' },
          type: { type: 'string', enum: ['maintenance', 'operations', 'engineering', 'safety'] },
          leaderId: { type: 'string' },
          isActive: { type: 'boolean' }
        }
      }
    }
  }, teamHandler.updateTeam.bind(teamHandler));

  // Delete team
  server.delete('/:id', {
    schema: {
      description: 'Delete team by ID',
      tags: ['Teams'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, teamHandler.deleteTeam.bind(teamHandler));

  // Add member to team
  server.post('/:id/members', {
    schema: {
      description: 'Add member to team',
      tags: ['Teams'],
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
          userId: { type: 'string' },
          role: { type: 'string' },
          specializations: {
            type: 'array',
            items: { type: 'string' }
          }
        },
        required: ['userId', 'role']
      }
    }
  }, teamHandler.addTeamMember.bind(teamHandler));

  // Remove member from team
  server.delete('/:id/members/:userId', {
    schema: {
      description: 'Remove member from team',
      tags: ['Teams'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          userId: { type: 'string' }
        },
        required: ['id', 'userId']
      }
    }
  }, teamHandler.removeTeamMember.bind(teamHandler));

  logger.info('Team routes registered successfully');
} 