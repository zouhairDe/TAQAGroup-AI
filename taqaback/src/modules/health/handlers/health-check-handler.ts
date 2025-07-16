import { FastifyRequest, FastifyReply } from 'fastify';
import { testDatabaseConnection } from '../../../core/database/client';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('HealthCheckHandler');

/**
 * Basic health response interface
 */
export interface BasicHealthResponse {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

/**
 * Detailed health response interface
 */
export interface DetailedHealthResponse extends BasicHealthResponse {
  database: {
    status: string;
    connected: boolean;
  };
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
}

/**
 * Handler for health check endpoints
 */
export class HealthCheckHandler {
  
  /**
   * Execute basic health check
   */
  async executeBasicHealthCheck(
    _request: FastifyRequest, 
    reply: FastifyReply
  ): Promise<BasicHealthResponse> {
    logger.info('Executing basic health check');
    
    const response: BasicHealthResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    reply.code(200);
    return response;
  }
  
  /**
   * Execute detailed health check including database connectivity
   */
  async executeDetailedHealthCheck(
    _request: FastifyRequest, 
    reply: FastifyReply
  ): Promise<DetailedHealthResponse> {
    logger.info('Executing detailed health check');
    
    try {
      // Test database connection
      const isDatabaseConnected: boolean = await testDatabaseConnection();
      
      // Get memory usage
      const memoryUsage = process.memoryUsage();
      const memoryPercentage: number = Math.round(
        (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      );
      
      const response: DetailedHealthResponse = {
        status: isDatabaseConnected ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: isDatabaseConnected ? 'connected' : 'disconnected',
          connected: isDatabaseConnected
        },
        memory: {
          used: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          percentage: memoryPercentage
        }
      };
      
      reply.code(isDatabaseConnected ? 200 : 503);
      return response;
      
    } catch (error) {
      logger.error('Health check failed:', error);
      
      const errorResponse = {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          status: 'error',
          connected: false
        },
        memory: {
          used: 0,
          total: 0,
          percentage: 0
        }
      };
      
      reply.code(503);
      return errorResponse;
    }
  }
} 