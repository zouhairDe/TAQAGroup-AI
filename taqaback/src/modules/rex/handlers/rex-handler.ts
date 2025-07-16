import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../../../core/database/client';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('RexHandler');

// Request/Response interfaces
interface CreateRexEntryRequest {
  Body: {
    title: string;
    description?: string;
    anomalyId?: string;
    equipmentId?: string;
    equipmentType?: string;
    category: string;
    subcategory?: string;
    site: string;
    zone?: string;
    building?: string;
    status?: string;
    priority: string;
    rootCause: string;
    lessonsLearned: string;
    preventiveActions: string[];
    solution: string;
    timeToResolve?: string;
    costImpact?: string;
    downtimeHours?: number;
    safetyImpact?: boolean;
    environmentalImpact?: boolean;
    productionImpact?: boolean;
    impactLevel?: string;
    tags: string[];
    knowledgeValue: string;
    effectiveness?: number;
    summary?: string;
    equipment?: string;
  }
}

interface UpdateRexEntryRequest {
  Params: { id: string };
  Body: {
    title?: string;
    description?: string;
    building?: string;
    equipment?: string;
    summary?: string;
    effectiveness?: number;
    status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
  }
}

interface GetRexEntryRequest {
  Params: { id: string };
}

interface GetRexEntriesQuery {
  Querystring: {
    status?: 'draft' | 'pending_review' | 'approved' | 'rejected';
    building?: string;
    equipment?: string;
    createdById?: string;
    approvedById?: string;
    page?: number;
    limit?: number;
  }
}

interface RejectRexEntryRequest {
  Params: { id: string };
  Body: { rejectionReason: string };
}

export class RexHandler {  /**
   * Create a new REX entry
   */
  async createRexEntry(
    request: FastifyRequest<CreateRexEntryRequest>,
    reply: FastifyReply
  ) {
    try {
      const userId = (request.user as { id: string }).id;
      const data = request.body;

      const rexEntry = await prisma.rEXEntry.create({
        data: {
          code: `REX-${Date.now()}`,
          title: data.title,
          anomalyId: data.anomalyId || null,
          equipmentId: data.equipmentId || null,
          equipmentType: data.equipmentType || null,
          category: data.category || 'general',
          subcategory: data.subcategory || null,
          site: data.site || 'main',
          zone: data.zone || null,
          building: data.building || null,
          status: data.status || 'draft',
          priority: data.priority || 'medium',
          rootCause: data.rootCause || '',
          lessonsLearned: data.lessonsLearned || '',
          preventiveActions: data.preventiveActions || [],
          solution: data.solution || '',
          timeToResolve: data.timeToResolve || null,
          costImpact: data.costImpact || null,
          downtimeHours: data.downtimeHours || null,
          safetyImpact: data.safetyImpact || false,
          environmentalImpact: data.environmentalImpact || false,
          productionImpact: data.productionImpact || false,
          impactLevel: data.impactLevel || null,
          tags: data.tags || [],
          knowledgeValue: data.knowledgeValue || 'medium',
          effectiveness: data.effectiveness || null,
          createdById: userId
        }
      });

      return { success: true, data: rexEntry };
    } catch (error) {
      logger.error('Error creating REX entry:', error);
      reply.code(500);
      return { 
        success: false, 
        message: 'Failed to create REX entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Update a REX entry
   */
  async updateRexEntry(
    request: FastifyRequest<UpdateRexEntryRequest>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const data = request.body;

      const rexEntry = await prisma.rEXEntry.update({
        where: { id },
        data
      });

      return { success: true, data: rexEntry };
    } catch (error) {
      logger.error('Error updating REX entry:', error);
      reply.code(500);
      return { 
        success: false, 
        message: 'Failed to update REX entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Delete a REX entry
   */
  async deleteRexEntry(
    request: FastifyRequest<GetRexEntryRequest>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      await prisma.rEXEntry.delete({
        where: { id }
      });

      return { success: true, message: 'REX entry deleted successfully' };
    } catch (error) {
      logger.error('Error deleting REX entry:', error);
      reply.code(500);
      return { 
        success: false, 
        message: 'Failed to delete REX entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get a REX entry by ID
   */
  async getRexEntry(
    request: FastifyRequest<GetRexEntryRequest>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;

      const rexEntry = await prisma.rEXEntry.findUnique({
        where: { id },
        include: {
          createdBy: true,
          approvedBy: true,
          comments: {
            include: {
              author: true
            }
          },
          attachments: true
        }
      });

      if (!rexEntry) {
        reply.code(404);
        return { success: false, message: 'REX entry not found' };
      }

      return { success: true, data: rexEntry };
    } catch (error) {
      logger.error('Error getting REX entry:', error);
      reply.code(500);
      return { 
        success: false, 
        message: 'Failed to get REX entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * List REX entries with filtering and pagination
   */
  async listRexEntries(
    request: FastifyRequest<GetRexEntriesQuery>,
    reply: FastifyReply
  ) {
    try {
      const {
        status,
        building,
        equipment,
        createdById,
        approvedById,
        page = 1,
        limit = 10
      } = request.query;

      const where: any = {};
      if (status) where.status = status;
      if (building) where.building = building;
      if (equipment) where.equipmentType = equipment;
      if (createdById) where.createdById = createdById;
      if (approvedById) where.approvedById = approvedById;

      const skip = (page - 1) * limit;

      const [rexEntries, total] = await Promise.all([
        prisma.rEXEntry.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            title: true,
            status: true,
            createdAt: true,
            site: true,
            zone: true,
            building: true,
            category: true,
            subcategory: true,
            priority: true,
            knowledgeValue: true,
            rating: true,
            views: true,
            bookmarks: true,
            tags: true,
            rootCause: true,
            lessonsLearned: true,
            solution: true,
            equipmentType: true,
            timeToResolve: true,
            reusabilityScore: true,
            safetyImpact: true,
            environmentalImpact: true,
            productionImpact: true,
            impactLevel: true,
            votes: true,
            effectiveness: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            approvedBy: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            comments: {
              select: {
                id: true,
                content: true,
                createdAt: true,
                author: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }),
        prisma.rEXEntry.count({ where })
      ]);

      // Format entries to match schema
      const formattedEntries = rexEntries.map(entry => ({
        id: entry.id,
        code: entry.code,
        title: entry.title,
        status: entry.status,
        createdAt: entry.createdAt.toISOString(),
        site: entry.site,
        zone: entry.zone ?? null,
        building: entry.building ?? null,
        category: entry.category,
        subcategory: entry.subcategory ?? null,
        priority: entry.priority,
        knowledgeValue: entry.knowledgeValue,
        rating: entry.rating ?? null,
        views: entry.views ?? 0,
        bookmarks: entry.bookmarks ?? 0,
        tags: entry.tags ?? [],
        rootCause: entry.rootCause,
        lessonsLearned: entry.lessonsLearned,
        solution: entry.solution,
        equipmentType: entry.equipmentType ?? null,
        timeToResolve: entry.timeToResolve ?? null,
        reusabilityScore: entry.reusabilityScore ?? null,
        safetyImpact: entry.safetyImpact ?? false,
        environmentalImpact: entry.environmentalImpact ?? false,
        productionImpact: entry.productionImpact ?? false,
        impactLevel: entry.impactLevel ?? null,
        votes: entry.votes ?? 0,
        effectiveness: entry.effectiveness ?? null,
        createdBy: {
          id: entry.createdBy.id,
          name: entry.createdBy.name ?? null,
          email: entry.createdBy.email
        },
        approvedBy: entry.approvedBy ? {
          id: entry.approvedBy.id,
          name: entry.approvedBy.name ?? null,
          email: entry.approvedBy.email
        } : null,
        comments: (entry.comments ?? []).map(comment => ({
          id: comment.id,
          content: comment.content,
          createdAt: comment.createdAt.toISOString(),
          author: {
            id: comment.author.id,
            name: comment.author.name ?? null
          }
        }))
      }));

      return {
        success: true,
        data: formattedEntries,
        meta: {
          page,
          limit,
          total
        }
      };
    } catch (error) {
      logger.error('Error in listRexEntries:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        query: request.query
      });
      reply.code(500);
      return {
        success: false,
        message: 'Failed to list REX entries',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Approve a REX entry
   */
  async approveRexEntry(
    request: FastifyRequest<GetRexEntryRequest>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const userId = (request.user as { id: string }).id;

      const rexEntry = await prisma.rEXEntry.update({
        where: { id },
        data: {
          status: 'approved',
          approvedById: userId,
          approvedAt: new Date()
        }
      });

      return { success: true, message: 'REX entry approved successfully' };
    } catch (error) {
      logger.error('Error approving REX entry:', error);
      reply.code(500);
      return { 
        success: false, 
        message: 'Failed to approve REX entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Reject a REX entry
   */
  async rejectRexEntry(
    request: FastifyRequest<RejectRexEntryRequest>,
    reply: FastifyReply
  ) {
    try {
      const { id } = request.params;
      const { rejectionReason } = request.body;

      await prisma.rEXEntry.update({
        where: { id },
        data: {
          status: 'rejected',
          comments: {
            create: {
              content: `Rejection reason: ${rejectionReason}`,
              authorId: (request.user as { id: string }).id
            }
          }
        }
      });

      return { success: true, message: 'REX entry rejected successfully' };
    } catch (error) {
      logger.error('Error rejecting REX entry:', error);
      reply.code(500);
      return { 
        success: false, 
        message: 'Failed to reject REX entry',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
} 