import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Add interface for authenticated request
interface AuthenticatedRequest extends FastifyRequest {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

// Validation schemas
const createSlotSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  anomalyId: z.string().min(1),
  estimatedDuration: z.number().optional(),
  priority: z.string().min(1),
  windowType: z.string().min(1),
  maintenancePeriodId: z.string().optional(),
  assignedTeamId: z.string().optional(),
  assignedToId: z.string().optional(),
  downtime: z.boolean().optional(),
  safetyPrecautions: z.array(z.string()).optional(),
  resourcesNeeded: z.array(z.string()).optional(),
  estimatedCost: z.number().optional(),
  productionImpact: z.boolean().optional(),
  notes: z.string().optional(),
  scheduledAt: z.string().datetime().optional(),
});

const updateSlotSchema = createSlotSchema.partial().extend({
  status: z.string().optional(),
  actualDuration: z.number().optional(),
  actualCost: z.number().optional(),
  completionNotes: z.string().optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

// Query string type for filtering
interface QueryString {
  status?: string;
  priority?: string;
  windowType?: string;
  maintenancePeriodId?: string;
  assignedTeamId?: string;
  assignedToId?: string;
  startDate?: string;
  endDate?: string;
}

export default async function slots(fastify: FastifyInstance) {
  // Add authentication hook for all routes in this plugin
  fastify.addHook('onRequest', async (request: FastifyRequest, reply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Authentication required' });
    }
  });

  // Get all slots with filtering
  fastify.get<{ Querystring: QueryString }>('/', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          priority: { type: 'string' },
          windowType: { type: 'string' },
          maintenancePeriodId: { type: 'string' },
          assignedTeamId: { type: 'string' },
          assignedToId: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const {
          status,
          priority,
          windowType,
          maintenancePeriodId,
          assignedTeamId,
          assignedToId,
          startDate,
          endDate,
        } = request.query;

        const where: any = {};

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (windowType) where.windowType = windowType;
        if (maintenancePeriodId) where.maintenancePeriodId = maintenancePeriodId;
        if (assignedTeamId) where.assignedTeamId = assignedTeamId;
        if (assignedToId) where.assignedToId = assignedToId;

        if (startDate || endDate) {
          where.scheduledAt = {};
          if (startDate) where.scheduledAt.gte = new Date(startDate);
          if (endDate) where.scheduledAt.lte = new Date(endDate);
        }

        const slots = await prisma.slot.findMany({
          where,
          include: {
            anomaly: true,
            assignedTeam: true,
            assignedTo: true,
            maintenancePeriod: true,
          },
          orderBy: {
            scheduledAt: 'asc',
          },
        });

        return slots;
      } catch (error) {
        console.error('Error fetching slots:', error);
        return reply.status(500).send({ error: 'Failed to fetch slots' });
      }
    },
  });

  // Get slots by anomaly ID
  fastify.get('/anomaly/:anomalyId', {
    schema: {
      params: {
        type: 'object',
        required: ['anomalyId'],
        properties: {
          anomalyId: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: { anomalyId: string } }>, reply) => {
      try {
        const { anomalyId } = request.params;
        const slots = await prisma.slot.findMany({
          where: { anomalyId },
          include: {
            assignedTeam: true,
            assignedTo: true,
            maintenancePeriod: true,
          },
          orderBy: {
            scheduledAt: 'asc',
          },
        });
        return slots;
      } catch (error) {
        console.error('Error fetching anomaly slots:', error);
        return reply.status(500).send({ error: 'Failed to fetch anomaly slots' });
      }
    },
  });

  // Get slots by maintenance period ID
  fastify.get('/maintenance-period/:periodId', {
    schema: {
      params: {
        type: 'object',
        required: ['periodId'],
        properties: {
          periodId: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: { periodId: string } }>, reply) => {
      try {
        const { periodId } = request.params;
        const slots = await prisma.slot.findMany({
          where: { maintenancePeriodId: periodId },
          include: {
            anomaly: true,
            assignedTeam: true,
            assignedTo: true,
          },
          orderBy: {
            scheduledAt: 'asc',
          },
        });
        return slots;
      } catch (error) {
        console.error('Error fetching maintenance period slots:', error);
        return reply.status(500).send({ error: 'Failed to fetch maintenance period slots' });
      }
    },
  });

  // Get single slot by ID
  fastify.get('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const { id } = request.params;
        const slot = await prisma.slot.findUnique({
          where: { id },
          include: {
            anomaly: true,
            assignedTeam: true,
            assignedTo: true,
            maintenancePeriod: true,
          },
        });

        if (!slot) {
          return reply.status(404).send({ error: 'Slot not found' });
        }

        return slot;
      } catch (error) {
        console.error('Error fetching slot:', error);
        return reply.status(500).send({ error: 'Failed to fetch slot' });
      }
    },
  });

  // Create new slot
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['title', 'anomalyId', 'priority', 'windowType'],
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          anomalyId: { type: 'string' },
          estimatedDuration: { type: 'number' },
          priority: { type: 'string' },
          windowType: { type: 'string', enum: ['planned', 'emergency', 'opportunistic'] },
          maintenancePeriodId: { type: 'string' },
          assignedTeamId: { type: 'string' },
          assignedToId: { type: 'string' },
          downtime: { type: 'boolean' },
          safetyPrecautions: { type: 'array', items: { type: 'string' } },
          resourcesNeeded: { type: 'array', items: { type: 'string' } },
          estimatedCost: { type: 'number' },
          productionImpact: { type: 'boolean' },
          notes: { type: 'string' },
          scheduledAt: { type: 'string', format: 'date-time' },
        },
      },
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            code: { type: 'string' },
            title: { type: 'string' },
            // ... other properties
          },
        },
      },
    },
    handler: async (request: FastifyRequest, reply) => {
      try {
        const slotData = request.body as z.infer<typeof createSlotSchema>;
        
        // Get user from JWT token
        const user = request.user as { id: string };
        if (!user?.id) {
          return reply.status(401).send({ error: 'User not authenticated' });
        }

        // Generate a unique code
        const code = `SLOT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        const slot = await prisma.slot.create({
          data: {
            ...slotData,
            code,
            createdById: user.id,
            status: 'scheduled',
          },
          include: {
            anomaly: true,
            assignedTeam: true,
            assignedTo: true,
            maintenancePeriod: true,
          },
        });

        return reply.status(201).send(slot);
      } catch (error) {
        console.error('Error creating slot:', error);
        return reply.status(500).send({ error: 'Failed to create slot' });
      }
    },
  });

  // Update slot
  fastify.put('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
      body: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          anomalyId: { type: 'string' },
          estimatedDuration: { type: 'number' },
          priority: { type: 'string' },
          windowType: { type: 'string' },
          maintenancePeriodId: { type: 'string' },
          assignedTeamId: { type: 'string' },
          assignedToId: { type: 'string' },
          downtime: { type: 'boolean' },
          safetyPrecautions: { type: 'array', items: { type: 'string' } },
          resourcesNeeded: { type: 'array', items: { type: 'string' } },
          estimatedCost: { type: 'number' },
          productionImpact: { type: 'boolean' },
          notes: { type: 'string' },
          scheduledAt: { type: 'string', format: 'date-time' },
          status: { type: 'string' },
          actualDuration: { type: 'number' },
          actualCost: { type: 'number' },
          completionNotes: { type: 'string' },
          startedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ 
      Params: { id: string }, 
      Body: z.infer<typeof updateSlotSchema> 
    }>, reply) => {
      try {
        const { id } = request.params;
        const updateData = request.body;

        const slot = await prisma.slot.update({
          where: { id },
          data: updateData,
          include: {
            anomaly: true,
            assignedTeam: true,
            assignedTo: true,
            maintenancePeriod: true,
          },
        });

        return slot;
      } catch (error) {
        console.error('Error updating slot:', error);
        return reply.status(500).send({ error: 'Failed to update slot' });
      }
    },
  });

  // Delete slot
  fastify.delete('/:id', {
    schema: {
      params: {
        type: 'object',
        required: ['id'],
        properties: {
          id: { type: 'string' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ Params: { id: string } }>, reply) => {
      try {
        const { id } = request.params;
        await prisma.slot.delete({
          where: { id },
        });
        return reply.status(204).send();
      } catch (error) {
        console.error('Error deleting slot:', error);
        return reply.status(500).send({ error: 'Failed to delete slot' });
      }
    },
  });

  // Get slots by team ID
  fastify.get('/team/:teamId', {
    schema: {
      params: {
        type: 'object',
        required: ['teamId'],
        properties: {
          teamId: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ 
      Params: { teamId: string },
      Querystring: { status?: string; startDate?: string; endDate?: string; }
    }>, reply) => {
      try {
        const { teamId } = request.params;
        const { status, startDate, endDate } = request.query;

        const where: any = { assignedTeamId: teamId };

        if (status) where.status = status;
        if (startDate || endDate) {
          where.scheduledAt = {};
          if (startDate) where.scheduledAt.gte = new Date(startDate);
          if (endDate) where.scheduledAt.lte = new Date(endDate);
        }

        const slots = await prisma.slot.findMany({
          where,
          include: {
            anomaly: true,
            maintenancePeriod: true,
            assignedTo: true,
          },
          orderBy: {
            scheduledAt: 'asc',
          },
        });

        return slots;
      } catch (error) {
        console.error('Error fetching team slots:', error);
        return reply.status(500).send({ error: 'Failed to fetch team slots' });
      }
    },
  });

  // Get slots by assigned user ID
  fastify.get('/assigned/:userId', {
    schema: {
      params: {
        type: 'object',
        required: ['userId'],
        properties: {
          userId: { type: 'string' },
        },
      },
      querystring: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
        },
      },
    },
    handler: async (request: FastifyRequest<{ 
      Params: { userId: string },
      Querystring: { status?: string; startDate?: string; endDate?: string; }
    }>, reply) => {
      try {
        const { userId } = request.params;
        const { status, startDate, endDate } = request.query;

        const where: any = { assignedToId: userId };

        if (status) where.status = status;
        if (startDate || endDate) {
          where.scheduledAt = {};
          if (startDate) where.scheduledAt.gte = new Date(startDate);
          if (endDate) where.scheduledAt.lte = new Date(endDate);
        }

        const slots = await prisma.slot.findMany({
          where,
          include: {
            anomaly: true,
            maintenancePeriod: true,
            assignedTeam: true,
          },
          orderBy: {
            scheduledAt: 'asc',
          },
        });

        return slots;
      } catch (error) {
        console.error('Error fetching user slots:', error);
        return reply.status(500).send({ error: 'Failed to fetch user slots' });
      }
    },
  });
} 