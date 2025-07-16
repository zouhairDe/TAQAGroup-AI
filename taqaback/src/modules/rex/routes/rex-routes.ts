import { FastifyInstance, RouteGenericInterface } from 'fastify';
import { RexHandler } from '../handlers/rex-handler';
import { AuthMiddleware } from '../../auth/middleware/auth-middleware';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('RexRoutes');

// Request interfaces
interface CreateRexRequest extends RouteGenericInterface {
  Body: {
    title: string;
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

interface UpdateRexRequest extends RouteGenericInterface {
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

interface GetRexRequest extends RouteGenericInterface {
  Params: { id: string };
}

interface ListRexRequest extends RouteGenericInterface {
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

interface RejectRexRequest extends RouteGenericInterface {
  Params: { id: string };
  Body: { rejectionReason: string };
}

/**
 * Register REX management routes
 */
export async function registerRexRoutes(server: FastifyInstance): Promise<void> {
  const rexHandler = new RexHandler();
  // Create REX entry
  server.post<CreateRexRequest>('/', {
    schema: {
      description: 'Create a new REX entry',
      tags: ['REX'],
      body: {
        type: 'object',
        required: ['title', 'category', 'site', 'priority', 'rootCause', 'lessonsLearned', 'solution', 'knowledgeValue'],
        properties: {
          title: { type: 'string', minLength: 1 },
          anomalyId: { type: 'string', nullable: true },
          equipmentId: { type: 'string', nullable: true },
          equipmentType: { type: 'string', nullable: true },
          category: { type: 'string', minLength: 1 },
          subcategory: { type: 'string', nullable: true },
          site: { type: 'string', minLength: 1 },
          zone: { type: 'string', nullable: true },
          building: { type: 'string', nullable: true },
          status: { type: 'string', enum: ['draft', 'pending_review', 'approved', 'rejected'], nullable: true },
          priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          rootCause: { type: 'string', minLength: 1 },
          lessonsLearned: { type: 'string', minLength: 1 },
          preventiveActions: { type: 'array', items: { type: 'string' } },
          solution: { type: 'string', minLength: 1 },
          timeToResolve: { type: 'string', nullable: true },
          costImpact: { type: 'string', nullable: true },
          downtimeHours: { type: 'number', minimum: 0, nullable: true },
          safetyImpact: { type: 'boolean', default: false },
          environmentalImpact: { type: 'boolean', default: false },
          productionImpact: { type: 'boolean', default: false },
          impactLevel: { type: 'string', enum: ['low', 'medium', 'high'], nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          knowledgeValue: { type: 'string', enum: ['low', 'medium', 'high'] },
          effectiveness: { type: 'number', minimum: 0, maximum: 100, nullable: true },
          summary: { type: 'string', nullable: true },
          equipment: { type: 'string', nullable: true }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                code: { type: 'string' },
                title: { type: 'string' },
                status: { type: 'string' },
                category: { type: 'string' },
                site: { type: 'string' },
                priority: { type: 'string' },
                knowledgeValue: { type: 'string' },
                createdAt: { type: 'string' }
              }
            }
          }
        }      }
    },
    onRequest: [AuthMiddleware.verifyToken]
  }, rexHandler.createRexEntry.bind(rexHandler));

  // Update REX entry
  server.put<UpdateRexRequest>('/:id', {
    schema: {
      description: 'Update a REX entry',
      tags: ['REX'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string', minLength: 1 },
          description: { type: 'string', minLength: 1 },
          building: { type: 'string', nullable: true },
          equipment: { type: 'string', nullable: true },
          summary: { type: 'string', nullable: true },
          effectiveness: { type: 'number', minimum: 0, maximum: 100, nullable: true },
          status: { 
            type: 'string',
            enum: ['draft', 'pending_review', 'approved', 'rejected']
          }
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
                code: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }        }      }
    },
    onRequest: [AuthMiddleware.verifyToken]
  }, rexHandler.updateRexEntry.bind(rexHandler));

  // Delete REX entry
  server.delete<GetRexRequest>('/:id', {
    schema: {
      description: 'Delete a REX entry',
      tags: ['REX'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }      }
    },
    onRequest: [AuthMiddleware.verifyToken]
  }, rexHandler.deleteRexEntry.bind(rexHandler));

  // Get REX entry by ID
  server.get<GetRexRequest>('/:id', {
    schema: {
      description: 'Get a REX entry by ID',
      tags: ['REX'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
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
                code: { type: 'string' },
                title: { type: 'string' },
                description: { type: 'string' }
              }
            }
          }
        }
      }    },
    onRequest: [AuthMiddleware.verifyToken]
  }, rexHandler.getRexEntry.bind(rexHandler));

  // List REX entries
  server.get<ListRexRequest>('/', {
    schema: {
      description: 'List REX entries with filtering and pagination',
      tags: ['REX'],
      querystring: {
        type: 'object',
        properties: {
          status: { 
            type: 'string',
            enum: ['draft', 'pending_review', 'approved', 'rejected'],
            nullable: true
          },
          building: { type: 'string', nullable: true },
          equipment: { type: 'string', nullable: true },
          createdById: { type: 'string', nullable: true },
          approvedById: { type: 'string', nullable: true },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          required: ['success', 'data', 'meta'],
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'array',
              items: {
                type: 'object',
                required: ['id', 'code', 'title', 'status', 'createdAt', 'site', 'category', 'priority', 'knowledgeValue', 'rootCause', 'lessonsLearned', 'solution'],
                properties: {
                  id: { type: 'string' },
                  code: { type: 'string' },
                  title: { type: 'string' },
                  status: { 
                    type: 'string',
                    enum: ['draft', 'pending_review', 'approved', 'rejected']
                  },
                  createdAt: { type: 'string', format: 'date-time' },
                  site: { type: 'string' },
                  zone: { type: 'string', nullable: true },
                  building: { type: 'string', nullable: true },
                  category: { type: 'string' },
                  subcategory: { type: 'string', nullable: true },
                  priority: { type: 'string' },
                  knowledgeValue: { type: 'string' },
                  rating: { type: 'number', nullable: true },
                  views: { type: 'number', default: 0 },
                  bookmarks: { type: 'number', default: 0 },
                  tags: { 
                    type: 'array', 
                    items: { type: 'string' },
                    default: []
                  },
                  rootCause: { type: 'string' },
                  lessonsLearned: { type: 'string' },
                  solution: { type: 'string' },
                  equipmentType: { type: 'string', nullable: true },
                  timeToResolve: { type: 'string', nullable: true },
                  reusabilityScore: { type: 'number', nullable: true },
                  safetyImpact: { type: 'boolean', default: false },
                  environmentalImpact: { type: 'boolean', default: false },
                  productionImpact: { type: 'boolean', default: false },
                  impactLevel: { type: 'string', nullable: true },
                  votes: { type: 'number', default: 0 },
                  effectiveness: { type: 'number', nullable: true },
                  createdBy: {
                    type: 'object',
                    required: ['id', 'email'],
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string', nullable: true },
                      email: { type: 'string' }
                    }
                  },
                  approvedBy: {
                    type: 'object',
                    nullable: true,
                    required: ['id', 'email'],
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string', nullable: true },
                      email: { type: 'string' }
                    }
                  },
                  comments: {
                    type: 'array',
                    default: [],
                    items: {
                      type: 'object',
                      required: ['id', 'content', 'createdAt', 'author'],
                      properties: {
                        id: { type: 'string' },
                        content: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        author: {
                          type: 'object',
                          required: ['id'],
                          properties: {
                            id: { type: 'string' },
                            name: { type: 'string', nullable: true }
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            meta: {
              type: 'object',
              required: ['page', 'limit', 'total'],
              properties: {
                page: { type: 'number', minimum: 1 },
                limit: { type: 'number', minimum: 1 },
                total: { type: 'number', minimum: 0 }
              }
            }
          }
        },
        500: {
          type: 'object',
          required: ['success', 'message'],
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }      },
    onRequest: [AuthMiddleware.verifyToken]
  }, rexHandler.listRexEntries.bind(rexHandler));

  // Approve REX entry
  server.post<GetRexRequest>('/:id/approve', {
    schema: {
      description: 'Approve a REX entry',
      tags: ['REX'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }
    },    onRequest: [AuthMiddleware.verifyToken]
  }, rexHandler.approveRexEntry.bind(rexHandler));

  // Reject REX entry
  server.post<RejectRexRequest>('/:id/reject', {
    schema: {
      description: 'Reject a REX entry',
      tags: ['REX'],
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' }
        }
      },
      body: {
        type: 'object',
        required: ['rejectionReason'],
        properties: {
          rejectionReason: { type: 'string', minLength: 1 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
          }
        }
      }      },
    onRequest: [AuthMiddleware.verifyToken]
  }, rexHandler.rejectRexEntry.bind(rexHandler));

  logger.info('REX routes registered successfully');
} 