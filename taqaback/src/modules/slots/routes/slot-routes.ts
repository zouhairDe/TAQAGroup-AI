import { FastifyInstance } from 'fastify';
import slots from '../../../routes/slots';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('SlotRoutes');

export async function registerSlotRoutes(fastify: FastifyInstance) {
  try {
    // Register the slots routes
    await fastify.register(slots);
    logger.info('Slot routes registered successfully');
  } catch (error) {
    logger.error('Failed to register slot routes:', error);
    throw error;
  }
} 