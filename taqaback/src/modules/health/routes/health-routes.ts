import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { HealthCheckHandler } from '../handlers/health-check-handler';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('HealthRoutes');

/**
 * Register health check routes
 */
export async function registerHealthRoutes(server: FastifyInstance): Promise<void> {
  const healthCheckHandler = new HealthCheckHandler();
  
  // Basic health check route
  server.get('/', {
    schema: {
      description: 'Basic health check endpoint',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            environment: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return healthCheckHandler.executeBasicHealthCheck(request, reply);
  });
  
  // Detailed health check route with database connectivity
  server.get('/detailed', {
    schema: {
      description: 'Detailed health check endpoint with database connectivity',
      tags: ['Health'],
      response: {
        200: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            uptime: { type: 'number' },
            environment: { type: 'string' },
            database: {
              type: 'object',
              properties: {
                status: { type: 'string' },
                connected: { type: 'boolean' }
              }
            },
            memory: {
              type: 'object',
              properties: {
                used: { type: 'number' },
                total: { type: 'number' },
                percentage: { type: 'number' }
              }
            }
          }
        },
        503: {
          type: 'object',
          properties: {
            status: { type: 'string' },
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return healthCheckHandler.executeDetailedHealthCheck(request, reply);
  });
  
  logger.info('Health routes registered successfully');
} 