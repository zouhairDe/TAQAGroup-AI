import { FastifyInstance } from 'fastify';
import {
  getMaintenancePeriods,
  getMaintenancePeriodById,
  createMaintenancePeriod,
  updateMaintenancePeriod,
  deleteMaintenancePeriod,
  importMaintenancePeriods,
  getMaintenanceStatistics
} from '../handlers/maintenance-handler';

export async function registerMaintenanceRoutes(fastify: FastifyInstance): Promise<void> {
  // Maintenance Periods Routes
  fastify.get('/periods', getMaintenancePeriods);
  fastify.post('/periods/import', importMaintenancePeriods);  // Moved before :id route
  fastify.get('/periods/:id', getMaintenancePeriodById);
  fastify.post('/periods', createMaintenancePeriod);
  fastify.put('/periods/:id', updateMaintenancePeriod);
  fastify.delete('/periods/:id', deleteMaintenancePeriod);
  fastify.get('/statistics', getMaintenanceStatistics);

  // Health check for maintenance module
  fastify.get('/health', async (request, reply) => {
    reply.send({
      success: true,
      message: 'Maintenance module is healthy',
      timestamp: new Date().toISOString()
    });
  });
} 