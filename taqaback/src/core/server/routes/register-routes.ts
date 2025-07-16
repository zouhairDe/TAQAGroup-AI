import { FastifyInstance } from 'fastify';
import { registerHealthRoutes } from '../../../modules/health/routes/health-routes';
import { registerUserRoutes } from '../../../modules/users/routes/user-routes';
import { registerAuthRoutes } from '../../../modules/auth/routes/auth-routes';
import { registerAnomalyRoutes } from '../../../modules/anomalies/routes/anomaly-routes';
import { registerDashboardRoutes } from '../../../modules/dashboard/routes/dashboard-routes';
import { registerTeamRoutes } from '../../../modules/teams/routes/team-routes';
import { registerEquipmentRoutes } from '../../../modules/equipment/routes/equipment-routes';
import { registerMaintenanceRoutes } from '../../../modules/maintenance/routes/maintenance-routes';
import { registerMaintenanceWindowRoutes } from '../../../modules/maintenance-windows/routes/maintenance-window-routes';
import { registerSlotRoutes } from '../../../modules/slots/routes/slot-routes';
import { registerRexRoutes } from '../../../modules/rex/routes/rex-routes';
import { registerMedallionRoutes } from '../../../modules/medallion/routes/medallion-routes';
import dataProcessingLogRoutes from '../../../modules/data-processing/routes/data-processing-log-routes';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('RouteRegistration');

export async function registerRoutes(fastify: FastifyInstance) {
  // Register all routes under /api/v1 prefix
  await fastify.register(async (fastify) => {
    // Register health routes first
    await fastify.register(registerHealthRoutes, { prefix: '/health' });
    await fastify.register(registerUserRoutes, { prefix: '/users' });
    await fastify.register(registerAuthRoutes, { prefix: '/auth' });
    await fastify.register(registerDashboardRoutes, { prefix: '/dashboard' });
    await fastify.register(registerTeamRoutes, { prefix: '/teams' });
    await fastify.register(registerEquipmentRoutes, { prefix: '/equipment' });
    await fastify.register(registerMaintenanceRoutes, { prefix: '/maintenance' });
    await fastify.register(registerMaintenanceWindowRoutes, { prefix: '/maintenance-windows' });
    await fastify.register(registerSlotRoutes, { prefix: '/slots' });
    await fastify.register(registerRexRoutes, { prefix: '/rex' });
    await fastify.register(registerAnomalyRoutes, { prefix: '/anomalies' });
    await fastify.register(registerMedallionRoutes);
    await fastify.register(dataProcessingLogRoutes, { prefix: '/data-processing' });

    logger.info('All routes registered successfully');
  }, { prefix: '/api/v1' });
} 