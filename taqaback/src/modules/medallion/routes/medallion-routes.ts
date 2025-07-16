import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { MedallionHandler } from '../handlers/medallion-handler';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('MedallionRoutes');

/**
 * Register medallion architecture routes
 */
export async function registerMedallionRoutes(server: FastifyInstance): Promise<void> {
  const medallionHandler = new MedallionHandler();

  // Import CSV file into Bronze layer
  server.post('/medallion/import/csv', {
    schema: {
      description: 'Import CSV file into Bronze layer with new medallion format (Num_equipement, Systeme, Description, Date de détéction de l\'anomalie, Description de l\'équipement, Section propriétaire, Fiabilité Intégrité, Disponibilté, Process Safety, Criticité)',
      tags: ['Medallion'],
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                totalRows: { type: 'number' },
                successCount: { type: 'number' },
                errorCount: { type: 'number' },
                errors: { type: 'array', items: { type: 'string' } },
                processingLogId: { type: 'string' },
                nextSteps: { type: 'array', items: { type: 'string' } }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return medallionHandler.importCSVFile(request, reply);
  });

  // Import sample data into Bronze layer
  server.post('/medallion/import/sample', {
    schema: {
      description: 'Import sample anomaly data into Bronze layer',
      tags: ['Medallion'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                totalRows: { type: 'number' },
                successCount: { type: 'number' },
                errorCount: { type: 'number' },
                errors: { type: 'array', items: { type: 'string' } },
                processingLogId: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return medallionHandler.importSampleData(request, reply);
  });

  // Process Bronze to Silver layer
  server.post('/medallion/process/bronze-to-silver', {
    schema: {
      description: 'Process data from Bronze to Silver layer (cleanse, validate, filter nulls/empties, remove duplicates)',
      tags: ['Medallion'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                recordsProcessed: { type: 'number' },
                recordsSucceeded: { type: 'number' },
                recordsFailed: { type: 'number' },
                duplicatesSkipped: { type: 'number' },
                nextStep: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return medallionHandler.processBronzeToSilver(request, reply);
  });

  // Process Silver to Gold layer
  server.post('/medallion/process/silver-to-gold', {
    schema: {
      description: 'Process data from Silver to Gold layer (create/update Anomaly records in main system)',
      tags: ['Medallion'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                recordsProcessed: { type: 'number' },
                recordsSucceeded: { type: 'number' },
                recordsFailed: { type: 'number' },
                note: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return medallionHandler.processSilverToGold(request, reply);
  });

  // Run complete medallion pipeline: Bronze -> Silver -> Gold
  server.post('/medallion/process/complete-pipeline', {
    schema: {
      description: 'Run complete medallion pipeline: Bronze -> Silver -> Gold',
      tags: ['Medallion'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                bronzeToSilver: {
                  type: 'object',
                  properties: {
                    recordsProcessed: { type: 'number' },
                    recordsSucceeded: { type: 'number' },
                    recordsFailed: { type: 'number' }
                  }
                },
                silverToGold: {
                  type: 'object',
                  properties: {
                    recordsProcessed: { type: 'number' },
                    recordsSucceeded: { type: 'number' },
                    recordsFailed: { type: 'number' }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    bronzeRecordsProcessed: { type: 'number' },
                    silverRecordsCreated: { type: 'number' },
                    goldAnomaliesCreated: { type: 'number' },
                    duplicatesSkipped: { type: 'number' },
                    pipelineSuccess: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return medallionHandler.runCompletePipeline(request, reply);
  });

  // Import CSV and run complete pipeline in one operation
  server.post('/medallion/import-and-process', {
    schema: {
      description: 'Import CSV file and run complete medallion pipeline in one operation',
      tags: ['Medallion'],
      consumes: ['multipart/form-data'],
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            result: {
              type: 'object',
              properties: {
                import: {
                  type: 'object',
                  properties: {
                    totalRows: { type: 'number' },
                    successCount: { type: 'number' },
                    errorCount: { type: 'number' }
                  }
                },
                pipeline: {
                  type: 'object',
                  properties: {
                    bronzeToSilver: { type: 'object' },
                    silverToGold: { type: 'object' }
                  }
                },
                summary: {
                  type: 'object',
                  properties: {
                    csvRecordsImported: { type: 'number' },
                    anomaliesCreated: { type: 'number' },
                    totalSuccess: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return medallionHandler.importAndProcess(request, reply);
  });

  // Get Bronze layer statistics
  server.get('/medallion/stats/bronze', {
    schema: {
      description: 'Get Bronze layer statistics',
      tags: ['Medallion'],
      response: {
        200: {
          type: 'object',
          properties: {
            totalRecords: { type: 'number' },
            processedRecords: { type: 'number' },
            unprocessedRecords: { type: 'number' },
            recentImports: { type: 'array' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return medallionHandler.getBronzeStats(request, reply);
  });

  // Get Silver layer statistics
  server.get('/medallion/stats/silver', {
    schema: {
      description: 'Get Silver layer statistics',
      tags: ['Medallion'],
      response: {
        200: {
          type: 'object',
          properties: {
            totalRecords: { type: 'number' },
            dataQualityScore: { type: 'number' },
            statusDistribution: { type: 'object' },
            sectionDistribution: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    return medallionHandler.getSilverStats(request, reply);
  });

  // Get Gold layer analytics
  server.get('/medallion/analytics/summary', {
    schema: {
      description: 'Get Gold layer analytics summary',
      tags: ['Medallion'],
      querystring: {
        type: 'object',
        properties: {
          period: { type: 'string', description: 'Report period (YYYY-MM format)' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            anomalySummaries: { type: 'array' },
            equipmentHealth: { type: 'array' },
            sectionPerformance: { type: 'array' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { period?: string } }>, reply: FastifyReply) => {
    return medallionHandler.getAnalyticsSummary(request, reply);
  });

  // Get processing logs
  server.get('/medallion/logs', {
    schema: {
      description: 'Get data processing logs',
      tags: ['Medallion'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          jobName: { type: 'string' }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            logs: { type: 'array' },
            total: { type: 'number' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { limit?: number; jobName?: string } }>, reply: FastifyReply) => {
    return medallionHandler.getProcessingLogs(request, reply);
  });

  // DEBUG ENDPOINTS - View table contents
  server.get('/medallion/debug/tables', {
    schema: {
      description: 'Get all medallion tables with their content (DEBUG)',
      tags: ['Medallion Debug'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            bronze: { type: 'object' },
            silver: { type: 'object' },
            gold: { type: 'object' },
            logs: { type: 'object' },
            users: { type: 'object' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    return medallionHandler.getAllTablesContent(request, reply);
  });

  // Per-layer debug endpoints
  server.get('/medallion/debug/tables/bronze', {
    schema: {
      description: 'Get Bronze layer tables (DEBUG)',
      tags: ['Medallion Debug'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            anomalies: { type: 'array' },
            equipment: { type: 'array' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    return medallionHandler.getBronzeDebugTables(request, reply);
  });

  server.get('/medallion/debug/tables/silver', {
    schema: {
      description: 'Get Silver layer tables (DEBUG)',
      tags: ['Medallion Debug'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            anomalies: { type: 'array' },
            equipment: { type: 'array' },
            sections: { type: 'array' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    return medallionHandler.getSilverDebugTables(request, reply);
  });

  server.get('/medallion/debug/tables/gold', {
    schema: {
      description: 'Get Gold layer tables (DEBUG)',
      tags: ['Medallion Debug'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
      },
      response: {
        200: {
          type: 'object',
          properties: {
            anomalies: { type: 'array' },
            equipmentHealth: { type: 'array' },
            sectionPerformance: { type: 'array' }
          }
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    return medallionHandler.getGoldDebugTables(request, reply);
  });

  server.get('/medallion/debug/tables/logs', {
    schema: {
      description: 'Get processing logs (DEBUG)',
      tags: ['Medallion Debug'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
      },
      response: {
        200: {
          type: 'array'
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    return medallionHandler.getLogsDebugTable(request, reply);
  });

  server.get('/medallion/debug/tables/users', {
    schema: {
      description: 'Get users table (DEBUG)',
      tags: ['Medallion Debug'],
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', minimum: 1, maximum: 50, default: 10 }
        }
      },
      response: {
        200: {
          type: 'array'
        }
      }
    }
  }, async (request: FastifyRequest<{ Querystring: { limit?: number } }>, reply: FastifyReply) => {
    return medallionHandler.getUsersDebugTable(request, reply);
  });

  logger.info('Medallion routes registered successfully');
} 