import { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import jwt from '@fastify/jwt';
import multipart from '@fastify/multipart';
import { getEnvironmentConfig } from '../../config/environment';
import { createLogger } from '../../utils/logger';
import { PrismaClient } from '@prisma/client';

const logger = createLogger('CorePlugins');

// Create a single instance of Prisma Client
const prisma = new PrismaClient();

// Declare module augmentation for Fastify
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

/**
 * Register all core plugins for the Fastify server
 */
export async function registerCorePlugins(server: FastifyInstance): Promise<void> {
  const config = getEnvironmentConfig();
  
  try {
    // Register Prisma as a plugin
    server.decorate('prisma', prisma);
    server.addHook('onClose', async (instance) => {
      await instance.prisma.$disconnect();
    });

    // Register CORS
    await server.register(cors, {
      origin: config.corsOrigin,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
    });

    // Register Helmet for security
    await server.register(helmet, {
      global: true
    });

    // Register JWT plugin
    await server.register(jwt, {
      secret: config.jwtSecret,
      sign: {
        expiresIn: '24h'
      }
    });

    // Register multipart for file uploads
    await server.register(multipart, {
      limits: {
        fieldNameSize: 1000, // Max field name size in bytes
        fieldSize: 1024 * 1024, // Max field value size in bytes (1MB)
        fields: 50, // Max number of non-file fields
        fileSize: 50 * 1024 * 1024, // Max file size in bytes (50MB)
        files: 10, // Max number of file fields
        headerPairs: 2000 // Max number of header key=>value pairs
      },
      attachFieldsToBody: true
    });
    
    // Register Swagger for API documentation
    await server.register(swagger, {
      swagger: {
        info: {
          title: 'TAQA Anomaly Management API',
          description: 'Backend API for managing equipment anomalies in the TAQA system',
          version: '1.0.0'
        },
        schemes: ['http'],
        consumes: ['application/json', 'multipart/form-data'],
        produces: ['application/json'],
        securityDefinitions: {
          Bearer: {
            type: 'apiKey',
            name: 'Authorization',
            in: 'header',
            description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
          }
        },
        tags: [
          { name: 'Health', description: 'Health check endpoints' },
          { name: 'Authentication', description: 'Authentication endpoints' },
          { name: 'Anomalies', description: 'Anomaly management endpoints' },
          { name: 'Users', description: 'User management endpoints' },
          { name: 'Teams', description: 'Team management endpoints' },
          { name: 'Equipment', description: 'Equipment management endpoints' },
          { name: 'Dashboard', description: 'Dashboard data endpoints' },
          { name: 'Maintenance', description: 'Maintenance management endpoints' },
          { name: 'Slots', description: 'Slot management endpoints' }
        ]
      }
    });
    
    // Register Swagger UI
    await server.register(swaggerUI, {
      routePrefix: '/documentation',
      uiConfig: {
        docExpansion: 'list',
        deepLinking: false
      },
      staticCSP: true,
      transformStaticCSP: (header) => header
    });

    logger.info('Core plugins registered successfully');
    
  } catch (error) {
    logger.error('Failed to register core plugins:', error);
    throw error;
  }
} 