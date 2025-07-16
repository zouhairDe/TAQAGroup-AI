import { FastifyRequest, FastifyReply } from 'fastify';
import { getDatabaseClient } from '../../../core/database/client';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('SlotHandler');
const prisma = getDatabaseClient();

interface CreateSlotRequest {
  title: string;
  description?: string;
  anomalyId: string;
  dates: string[]; // ISO date strings
  estimatedDuration?: number;
  priority: string;
  assignedTeamId?: string;
  assignedToId?: string;
  windowType: string;
  downtime?: boolean;
  safetyPrecautions?: string[];
  resourcesNeeded?: string[];
  estimatedCost?: number;
  productionImpact?: boolean;
  notes?: string;
}

interface UpdateSlotRequest {
  id: string;
  title?: string;
  description?: string;
  dates?: string[];
  estimatedDuration?: number;
  actualDuration?: number;
  status?: string;
  priority?: string;
  assignedTeamId?: string;
  assignedToId?: string;
  windowType?: string;
  downtime?: boolean;
  safetyPrecautions?: string[];
  resourcesNeeded?: string[];
  estimatedCost?: number;
  actualCost?: number;
  productionImpact?: boolean;
  notes?: string;
  completionNotes?: string;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
}

function generateSlotCode(): string {
  const year = new Date().getFullYear();
  const timestamp = Date.now().toString().slice(-6);
  return `SLT-${year}-${timestamp}`;
}

export async function createSlot(
  request: FastifyRequest<{ Body: CreateSlotRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const {
      title,
      description,
      anomalyId,
      dates,
      estimatedDuration,
      priority,
      assignedTeamId,
      assignedToId,
      windowType,
      downtime = false,
      safetyPrecautions = [],
      resourcesNeeded = [],
      estimatedCost,
      productionImpact = false,
      notes
    } = request.body;

    // Get user ID from session/token (assuming it's available in request)
    const createdById = (request as any).user?.id;
    if (!createdById) {
      await reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    // Validate anomaly exists
    const anomaly = await prisma.anomaly.findUnique({
      where: { id: anomalyId }
    });

    if (!anomaly) {
      await reply.status(404).send({ error: 'Anomaly not found' });
      return;
    }

    // Convert date strings to Date objects
    const parsedDates = dates.map(date => new Date(date));

    // Validate dates are in the future
    const now = new Date();
    const futureDates = parsedDates.filter(date => date > now);
    if (futureDates.length !== parsedDates.length) {
      await reply.status(400).send({ error: 'All dates must be in the future' });
      return;
    }

    // Create slot
    const slot = await prisma.slot.create({
      data: {
        code: generateSlotCode(),
        title,
        description: description ?? null,
        anomalyId,
        dates: parsedDates,
        estimatedDuration: estimatedDuration ?? null,
        priority,
        createdById,
        assignedTeamId: assignedTeamId ?? null,
        assignedToId: assignedToId ?? null,
        windowType,
        downtime,
        safetyPrecautions,
        resourcesNeeded,
        estimatedCost: estimatedCost ?? null,
        productionImpact,
        notes: notes ?? null,
        scheduledAt: new Date()
      },
      include: {
        anomaly: {
          select: {
            id: true,
            code: true,
            title: true,
            severity: true,
            priority: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTeam: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    logger.info(`Slot created successfully: ${slot.code}`);
    await reply.status(201).send({ data: slot });
  } catch (error) {
    logger.error('Error creating slot:', error);
    await reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getSlots(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const slots = await prisma.slot.findMany({
      include: {
        anomaly: {
          select: {
            id: true,
            code: true,
            title: true,
            severity: true,
            priority: true,
            equipment: {
              select: {
                id: true,
                name: true,
                code: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTeam: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    await reply.send({ data: slots });
  } catch (error) {
    logger.error('Error fetching slots:', error);
    await reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getSlotById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;

    const slot = await prisma.slot.findUnique({
      where: { id },
      include: {
        anomaly: {
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            severity: true,
            priority: true,
            status: true,
            equipment: {
              select: {
                id: true,
                name: true,
                code: true,
                type: true
              }
            }
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTeam: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!slot) {
      await reply.status(404).send({ error: 'Slot not found' });
      return;
    }

    await reply.send({ data: slot });
  } catch (error) {
    logger.error('Error fetching slot:', error);
    await reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function updateSlot(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateSlotRequest }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;
    const updateData = request.body;

    // Check if slot exists
    const existingSlot = await prisma.slot.findUnique({
      where: { id }
    });

    if (!existingSlot) {
      await reply.status(404).send({ error: 'Slot not found' });
      return;
    }

    // Parse dates if provided
    const parsedData: any = { ...updateData };
    if (updateData.dates) {
      parsedData.dates = updateData.dates.map(date => new Date(date));
    }
    if (updateData.scheduledAt) {
      parsedData.scheduledAt = new Date(updateData.scheduledAt);
    }
    if (updateData.startedAt) {
      parsedData.startedAt = new Date(updateData.startedAt);
    }
    if (updateData.completedAt) {
      parsedData.completedAt = new Date(updateData.completedAt);
    }

    // Remove the id from update data
    delete parsedData.id;

    const updatedSlot = await prisma.slot.update({
      where: { id },
      data: parsedData,
      include: {
        anomaly: {
          select: {
            id: true,
            code: true,
            title: true,
            severity: true,
            priority: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTeam: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    logger.info(`Slot updated successfully: ${updatedSlot.code}`);
    await reply.send({ data: updatedSlot });
  } catch (error) {
    logger.error('Error updating slot:', error);
    await reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function deleteSlot(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { id } = request.params;

    // Check if slot exists
    const existingSlot = await prisma.slot.findUnique({
      where: { id }
    });

    if (!existingSlot) {
      await reply.status(404).send({ error: 'Slot not found' });
      return;
    }

    // Delete the slot
    await prisma.slot.delete({
      where: { id }
    });

    logger.info(`Slot deleted successfully: ${existingSlot.code}`);
    await reply.status(204).send();
  } catch (error) {
    logger.error('Error deleting slot:', error);
    await reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getSlotsByAnomaly(
  request: FastifyRequest<{ Params: { anomalyId: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const { anomalyId } = request.params;

    const slots = await prisma.slot.findMany({
      where: { anomalyId },
      include: {
        anomaly: {
          select: {
            id: true,
            code: true,
            title: true,
            severity: true,
            priority: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTeam: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    await reply.send({ data: slots });
  } catch (error) {
    logger.error('Error fetching slots by anomaly:', error);
    await reply.status(500).send({ error: 'Internal server error' });
  }
}

export async function getAvailableWindows(
  _request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    // This would typically come from a configuration table or external system
    // For now, we'll return the windows you provided in the requirements
    const availableWindows = [
      {
        id: 'window-1',
        startDate: '2025-01-08T00:00:00.000Z',
        endDate: '2025-01-14T23:59:59.999Z',
        durationDays: 7,
        durationHours: 168,
        description: 'January maintenance window'
      },
      {
        id: 'window-2',
        startDate: '2025-02-09T00:00:00.000Z',
        endDate: '2025-02-12T23:59:59.999Z',
        durationDays: 4,
        durationHours: 96,
        description: 'February maintenance window'
      },
      {
        id: 'window-3',
        startDate: '2026-01-02T00:00:00.000Z',
        endDate: '2026-02-02T23:59:59.999Z',
        durationDays: 30,
        durationHours: 720,
        description: 'Extended maintenance window'
      }
    ];

    await reply.send({ data: availableWindows });
  } catch (error) {
    logger.error('Error fetching available windows:', error);
    await reply.status(500).send({ error: 'Internal server error' });
  }
} 