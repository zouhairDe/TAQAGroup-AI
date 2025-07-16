import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { createLogger } from '../../../core/utils/logger';
import { PrismaClient } from '@prisma/client';

const logger = createLogger('AnomalyActionHandler');
const prisma = new PrismaClient();

export class AnomalyActionHandler {
  constructor(private server: FastifyInstance) {}

  async getActions(request: FastifyRequest<{
    Params: { anomalyId: string };
    Querystring: {
      type?: string;
      startDate?: string;
      endDate?: string;
      limit?: number;
      offset?: number;
      category?: string;
      teamId?: string;
    };
  }>, reply: FastifyReply) {
    try {
      const { anomalyId } = request.params;
      const { type, startDate, endDate, limit = 50, offset = 0, category, teamId } = request.query;

      // Build filter conditions
      const where: any = {
        anomalyId,
        ...(type && { type }),
        ...(category && { category }),
        ...(teamId && { teamId }),
        ...(startDate && endDate && {
          createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        })
      };

      // Get total count for pagination
      const total = await prisma.anomalyAction.count({ where });

      // Get actions with pagination
      const actions = await prisma.anomalyAction.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          performedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      return reply.send({
        success: true,
        data: actions,
        total
      });
    } catch (error) {
      logger.error('Error getting anomaly actions:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async createAction(request: FastifyRequest<{
    Params: { anomalyId: string };
    Body: {
      type: string;
      title: string;
      description: string;
      metadata?: any;
      teamId?: string;
      status?: string;
      priority?: string;
      severity?: string;
      category?: string;
      impact?: any;
      maintenanceData?: any;
      attachments?: string[];
      isAutomated?: boolean;
      aiConfidence?: number;
    };
  }>, reply: FastifyReply) {
    try {
      const { anomalyId } = request.params;
      const actionData = request.body;
      const userId = request.user.id;

      // Create the action
      const action = await prisma.anomalyAction.create({
        data: {
          ...actionData,
          anomalyId,
          performedById: userId
        },
        include: {
          performedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          team: actionData.teamId ? {
            select: {
              id: true,
              name: true,
              code: true
            }
          } : false
        }
      });

      return reply.status(201).send({
        success: true,
        data: action
      });
    } catch (error) {
      logger.error('Error creating anomaly action:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async getActionById(request: FastifyRequest<{
    Params: { anomalyId: string; actionId: string };
  }>, reply: FastifyReply) {
    try {
      const { anomalyId, actionId } = request.params;

      const action = await prisma.anomalyAction.findFirst({
        where: {
          id: actionId,
          anomalyId
        },
        include: {
          performedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      if (!action) {
        return reply.status(404).send({
          success: false,
          error: 'Action not found'
        });
      }

      return reply.send({
        success: true,
        data: action
      });
    } catch (error) {
      logger.error('Error getting anomaly action:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async updateAction(request: FastifyRequest<{
    Params: { anomalyId: string; actionId: string };
    Body: {
      type?: string;
      title?: string;
      description?: string;
      metadata?: any;
      teamId?: string;
      status?: string;
      priority?: string;
      severity?: string;
      category?: string;
      impact?: any;
      maintenanceData?: any;
      attachments?: string[];
      isAutomated?: boolean;
      aiConfidence?: number;
    };
  }>, reply: FastifyReply) {
    try {
      const { anomalyId, actionId } = request.params;
      const actionData = request.body;

      const action = await prisma.anomalyAction.update({
        where: {
          id: actionId,
          anomalyId
        },
        data: actionData,
        include: {
          performedBy: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          team: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        }
      });

      return reply.send({
        success: true,
        data: action
      });
    } catch (error) {
      logger.error('Error updating anomaly action:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  async deleteAction(request: FastifyRequest<{
    Params: { anomalyId: string; actionId: string };
  }>, reply: FastifyReply) {
    try {
      const { anomalyId, actionId } = request.params;

      await prisma.anomalyAction.delete({
        where: {
          id: actionId,
          anomalyId
        }
      });

      return reply.send({
        success: true
      });
    } catch (error) {
      logger.error('Error deleting anomaly action:', error);
      return reply.status(500).send({
        success: false,
        error: 'Internal server error'
      });
    }
  }
} 