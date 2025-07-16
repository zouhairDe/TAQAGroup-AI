import { FastifyInstance } from 'fastify';
import { buildServer } from './core/server/build-server';
import { loadEnvironmentVariables } from './core/config/environment';
import { createLogger } from './core/utils/logger';

/**
 * Main application entry point
 * Initializes and starts the Fastify server
 */
async function startApplication(): Promise<void> {
  const logger = createLogger('Application');
  
  try {
    // Load environment variables
    loadEnvironmentVariables();
    
    // Build the server
    const server: FastifyInstance = await buildServer();
    
    // Start the server
    const host: string = process.env.HOST || '0.0.0.0';
    const port: number = parseInt(process.env.PORT || '3333', 10);
    
    await server.listen({ 
      host, 
      port 
    });
    
    logger.info(`Server running at http://${host}:${port}`);
    logger.info(`Swagger documentation available at http://${host}:${port}/documentation`);
    
  } catch (error) {
    logger.error('Failed to start application:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

// Start the application
startApplication(); 