import { FastifyInstance } from 'fastify';
import { EquipmentHandler } from '../handlers/equipment-handler';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('EquipmentRoutes');

/**
 * Register equipment management routes
 */
export async function registerEquipmentRoutes(server: FastifyInstance): Promise<void> {
  const equipmentHandler = new EquipmentHandler();

  // Get all equipment with filtering and pagination
  server.get('/', {
    schema: {
      description: 'Get all equipment with filtering and pagination',
      tags: ['Equipment'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          type: { type: 'string' },
          manufacturer: { type: 'string' },
          zoneId: { type: 'string' },
          site: { type: 'string' },
          status: { type: 'string', enum: ['operational', 'maintenance', 'faulty', 'decommissioned'] },
          isActive: { type: 'boolean' },
          search: { type: 'string' }
        }
      }
    }
  }, equipmentHandler.getAllEquipment.bind(equipmentHandler));

  // Get equipment by ID
  server.get('/:id', {
    schema: {
      description: 'Get equipment by ID',
      tags: ['Equipment'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, equipmentHandler.getEquipmentById.bind(equipmentHandler));

  // Create new equipment
  server.post('/', {
    schema: {
      description: 'Create new equipment',
      tags: ['Equipment'],
      body: {
        type: 'object',
        properties: {
          code: { type: 'string', minLength: 2 },
          name: { type: 'string', minLength: 2 },
          type: { type: 'string', minLength: 2 },
          model: { type: 'string' },
          manufacturer: { type: 'string' },
          serialNumber: { type: 'string' },
          installationDate: { type: 'string', format: 'date-time' },
          zoneId: { type: 'string' },
          specifications: { type: 'object' },
          isActive: { type: 'boolean', default: true }
        },
        required: ['code', 'name', 'type', 'zoneId']
      }
    }
  }, equipmentHandler.createEquipment.bind(equipmentHandler));

  // Update equipment
  server.put('/:id', {
    schema: {
      description: 'Update equipment by ID',
      tags: ['Equipment'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2 },
          type: { type: 'string', minLength: 2 },
          model: { type: 'string' },
          manufacturer: { type: 'string' },
          serialNumber: { type: 'string' },
          installationDate: { type: 'string', format: 'date-time' },
          zoneId: { type: 'string' },
          specifications: { type: 'object' },
          isActive: { type: 'boolean' },
          status: { type: 'string', enum: ['operational', 'maintenance', 'faulty', 'decommissioned'] }
        }
      }
    }
  }, equipmentHandler.updateEquipment.bind(equipmentHandler));

  // Delete equipment
  server.delete('/:id', {
    schema: {
      description: 'Delete equipment by ID',
      tags: ['Equipment'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, equipmentHandler.deleteEquipment.bind(equipmentHandler));

  // Get equipment statistics
  server.get('/stats/overview', {
    schema: {
      description: 'Get equipment statistics overview',
      tags: ['Equipment']
    }
  }, equipmentHandler.getEquipmentStats.bind(equipmentHandler));

  // Get equipment health overview
  server.get('/health/overview', {
    schema: {
      description: 'Get equipment health overview',
      tags: ['Equipment']
    }
  }, equipmentHandler.getEquipmentHealth.bind(equipmentHandler));

  logger.info('Equipment routes registered successfully');
} 