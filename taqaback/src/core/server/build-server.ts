import Fastify, { FastifyInstance } from 'fastify';
import { registerCorePlugins } from './plugins/core-plugins';
import { registerRoutes } from './routes/register-routes';
import { getEnvironmentConfig } from '../config/environment';
import { createLogger } from '../utils/logger';

const logger = createLogger('Server');

/**
 * Build and configure the Fastify server
 */
export async function buildServer(): Promise<FastifyInstance> {
  const config = getEnvironmentConfig();
  
  const server: FastifyInstance = Fastify({
    logger: false, // We use our custom logger
    disableRequestLogging: config.nodeEnv === 'production'
  });
  
  try {
    // Register core plugins (CORS, Helmet, Swagger, etc.)
    await registerCorePlugins(server);
    
    // Register all application routes
    await registerRoutes(server);
    
    logger.info('Server built successfully');
    return server;
    
  } catch (error) {
    logger.error('Failed to build server:', error);
    throw error;
  }
} 