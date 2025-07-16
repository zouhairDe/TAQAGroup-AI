import { FastifyInstance } from 'fastify';
import { AnomalyHandler } from '../handlers/anomaly-handler';
import { AnomalyImportHandler } from '../handlers/anomaly-import-handler';
import { EnhancedAnomalyImportHandler } from '../handlers/enhanced-anomaly-import-handler';
import { AnomalyActionHandler } from '../handlers/anomaly-action-handler';
import { DirectAnomalyHandler } from '../handlers/direct-anomaly-handler';
import { AuthMiddleware } from '../../auth/middleware/auth-middleware';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('AnomalyRoutes');

/**
 * Register anomaly management routes
 */
export async function registerAnomalyRoutes(server: FastifyInstance): Promise<void> {
  const anomalyHandler = new AnomalyHandler();
  const importHandler = new AnomalyImportHandler();
  const enhancedImportHandler = new EnhancedAnomalyImportHandler();
  const actionHandler = new AnomalyActionHandler(server);
  const directHandler = new DirectAnomalyHandler();

  // Get anomaly statistics
  server.get('/stats/overview', {
    schema: {
      description: 'Get anomaly statistics overview',
      tags: ['Anomalies']
    }
  }, anomalyHandler.getAnomalyStats.bind(anomalyHandler));

  // Get all anomalies with filtering and pagination
  server.get('/', {
    schema: {
      description: 'Get all anomalies with filtering and pagination',
      tags: ['Anomalies'],
      querystring: {
        type: 'object',
        properties: {
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 10 },
          status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] },
          priority: { type: 'string', enum: ['low', 'medium', 'critical'] },
          severity: { type: 'string', enum: ['low', 'medium', 'critical'] },
          category: { type: 'string' },
          equipmentId: { type: 'string' },
          reportedById: { type: 'string' },
          assignedToId: { type: 'string' },
          site: { type: 'string' },
          dateFrom: { type: 'string', format: 'date' },
          dateTo: { type: 'string', format: 'date' },
          search: { type: 'string' }
        }
      }
    }
  }, anomalyHandler.getAllAnomalies.bind(anomalyHandler));

  // Get anomaly by ID
  server.get('/:id', {
    schema: {
      description: 'Get anomaly by ID',
      tags: ['Anomalies'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, anomalyHandler.getAnomalyById.bind(anomalyHandler));

  // Create new anomaly
  server.post('/', {
    schema: {
      description: 'Create a new anomaly',
      tags: ['Anomalies'],
      body: {
        type: 'object',
        properties: {
          equipmentId: { type: 'string' },
          reportedById: { type: 'string' },
          title: { type: 'string', minLength: 3 },
          description: { type: 'string', minLength: 10 },
          priority: { type: 'string', enum: ['low', 'medium', 'critical'] },
          severity: { type: 'string', enum: ['low', 'medium', 'critical'] },
          category: { type: 'string' },
          reportedAt: { type: 'string', format: 'date-time' },
          // Add availability factors
          disponibilite: { type: 'number', minimum: 0, maximum: 3 },
          fiabilite: { type: 'number', minimum: 0, maximum: 3 },
          processSafety: { type: 'number', minimum: 0, maximum: 3 },
          sectionProprietaire: { type: 'string' },
          estimatedTimeToResolve: { type: 'string' }
        },
        required: ['equipmentId', 'reportedById', 'title', 'description', 'category']
      }
    }
  }, anomalyHandler.createAnomaly.bind(anomalyHandler));

  // Get AI prediction for anomaly creation
  server.post('/ai-prediction', {
    schema: {
      description: 'Get AI prediction for anomaly creation when availability factors are missing',
      tags: ['Anomalies'],
      body: {
        type: 'object',
        properties: {
          description: { type: 'string', minLength: 10 },
          equipmentId: { type: 'string' }
        },
        required: ['description', 'equipmentId']
      }
    }
  }, anomalyHandler.getAIPrediction.bind(anomalyHandler));

  // Update anomaly
  server.put('/:id', {
    schema: {
      description: 'Update anomaly by ID',
      tags: ['Anomalies'],
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
          title: { type: 'string', minLength: 3 },
          description: { type: 'string', minLength: 10 },
          priority: { type: 'string', enum: ['low', 'medium', 'critical'] },
          severity: { type: 'string', enum: ['low', 'medium', 'critical'] },
          status: { type: 'string', enum: ['open', 'in_progress', 'resolved', 'closed'] },
          category: { type: 'string' },
          assignedToId: { type: 'string' },
          resolvedAt: { type: 'string', format: 'date-time' },
          resolution: { type: 'string' }
        }
      }
    }
  }, anomalyHandler.updateAnomaly.bind(anomalyHandler));

  // Delete anomaly
  server.delete('/:id', {
    schema: {
      description: 'Delete anomaly by ID',
      tags: ['Anomalies'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      }
    }
  }, anomalyHandler.deleteAnomaly.bind(anomalyHandler));

  // Add comment to anomaly
  server.post('/:id/comments', {
    schema: {
      description: 'Add comment to anomaly',
      tags: ['Anomalies'],
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
          content: { type: 'string', minLength: 1 },
          authorId: { type: 'string' }
        },
        required: ['content', 'authorId']
      }
    }
  }, anomalyHandler.addComment.bind(anomalyHandler));

  // Import anomalies from CSV using medallion architecture
  server.post('/import/csv', {
    preHandler: [AuthMiddleware.verifyToken],
    schema: {
      description: 'Import anomalies from CSV file using medallion architecture (Bronze -> Silver -> Gold with AI enrichment)',
      tags: ['Anomalies'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          csvFile: { type: 'object', format: 'binary' }
        },
        required: ['csvFile']
      }
    }
  }, enhancedImportHandler.importFromCsv.bind(enhancedImportHandler));

  // Legacy import (old method) - kept for backward compatibility
  server.post('/import/csv/legacy', {
    schema: {
      description: 'Import anomalies from CSV file (legacy method)',
      tags: ['Anomalies'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          csvFile: { type: 'object', format: 'binary' }
        },
        required: ['csvFile']
      }
    }
  }, importHandler.importFromCsv.bind(importHandler));

  // Direct import - bypassing medallion architecture
  server.post('/direct/import', {
    schema: {
      description: 'Import CSV/Excel file directly to anomalies table',
      tags: ['Anomalies'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          file: { type: 'object', format: 'binary' }
        },
        required: ['file']
      }
    }
  }, directHandler.importFile.bind(directHandler));

  // Process anomalies with AI
  server.post('/direct/process-ai', {
    schema: {
      description: 'Process all anomalies missing AI fields with AI service',
      tags: ['Anomalies'],
      body: {
        type: 'object',
        properties: {
          batchSize: { type: 'number', minimum: 1, maximum: 100, default: 50 }
        }
      }
    }
  }, directHandler.processAnomaliesWithAI.bind(directHandler));

  // Get all actions for an anomaly
  server.get('/:anomalyId/actions', {
    schema: {
      description: 'Get all actions for an anomaly',
      tags: ['Anomalies'],
      params: {
        type: 'object',
        properties: {
          anomalyId: { type: 'string' }
        },
        required: ['anomalyId']
      },
      querystring: {
        type: 'object',
        properties: {
          type: { type: 'string', nullable: true },
          startDate: { type: 'string', format: 'date-time', nullable: true },
          endDate: { type: 'string', format: 'date-time', nullable: true },
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
          category: { type: 'string', nullable: true },
          teamId: { type: 'string', nullable: true }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { 
              type: 'array',
              items: { type: 'object', additionalProperties: true }
            },
            total: { type: 'number' }
          }
        }
      }
    }
  }, actionHandler.getActions.bind(actionHandler));

  // Create a new action
  server.post('/:anomalyId/actions', {
    schema: {
      description: 'Create a new action for an anomaly',
      tags: ['Anomalies'],
      params: {
        type: 'object',
        properties: {
          anomalyId: { type: 'string' }
        },
        required: ['anomalyId']
      },
      body: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          metadata: { type: 'object', additionalProperties: true },
          teamId: { type: 'string', nullable: true },
          status: { type: 'string', nullable: true },
          priority: { type: 'string', nullable: true },
          severity: { type: 'string', nullable: true },
          category: { type: 'string', nullable: true },
          impact: { type: 'object', additionalProperties: true, nullable: true },
          maintenanceData: { type: 'object', additionalProperties: true, nullable: true },
          attachments: { type: 'array', items: { type: 'string' }, default: [] },
          isAutomated: { type: 'boolean', default: false },
          aiConfidence: { type: 'number', nullable: true }
        },
        required: ['type', 'title', 'description']
      },
      response: {
        201: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object', additionalProperties: true }
          }
        }
      }
    }
  }, actionHandler.createAction.bind(actionHandler));

  // Get a specific action
  server.get('/:anomalyId/actions/:actionId', {
    schema: {
      description: 'Get a specific action',
      tags: ['Anomalies'],
      params: {
        type: 'object',
        properties: {
          anomalyId: { type: 'string' },
          actionId: { type: 'string' }
        },
        required: ['anomalyId', 'actionId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object', additionalProperties: true }
          }
        }
      }
    }
  }, actionHandler.getActionById.bind(actionHandler));

  // Update an action
  server.put('/:anomalyId/actions/:actionId', {
    schema: {
      description: 'Update an action',
      tags: ['Anomalies'],
      params: {
        type: 'object',
        properties: {
          anomalyId: { type: 'string' },
          actionId: { type: 'string' }
        },
        required: ['anomalyId', 'actionId']
      },
      body: {
        type: 'object',
        properties: {
          type: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          metadata: { type: 'object', additionalProperties: true },
          teamId: { type: 'string', nullable: true },
          status: { type: 'string', nullable: true },
          priority: { type: 'string', nullable: true },
          severity: { type: 'string', nullable: true },
          category: { type: 'string', nullable: true },
          impact: { type: 'object', additionalProperties: true, nullable: true },
          maintenanceData: { type: 'object', additionalProperties: true, nullable: true },
          attachments: { type: 'array', items: { type: 'string' }, default: [] },
          isAutomated: { type: 'boolean', default: false },
          aiConfidence: { type: 'number', nullable: true }
        },
        required: ['type', 'title', 'description']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object', additionalProperties: true }
          }
        }
      }
    }
  }, actionHandler.updateAction.bind(actionHandler));

  // Delete an action
  server.delete('/:anomalyId/actions/:actionId', {
    schema: {
      description: 'Delete an action',
      tags: ['Anomalies'],
      params: {
        type: 'object',
        properties: {
          anomalyId: { type: 'string' },
          actionId: { type: 'string' }
        },
        required: ['anomalyId', 'actionId']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' }
          }
        }
      }
    }
  }, actionHandler.deleteAction.bind(actionHandler));

  logger.info('Anomaly routes registered successfully');
}