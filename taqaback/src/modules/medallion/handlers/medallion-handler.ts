import { FastifyRequest, FastifyReply } from 'fastify';
import { MedallionDataProcessor } from '../../../core/services/medallion-data-processor';
import { CSVImportService } from '../../../core/services/csv-import-service';
import { getDatabaseClient } from '../../../core/database/client';
import { createLogger } from '../../../core/utils/logger';

const logger = createLogger('MedallionHandler');

/**
 * Handler for medallion architecture operations
 */
export class MedallionHandler {
  private readonly processor: MedallionDataProcessor;
  private readonly csvImportService: CSVImportService;
  private readonly prisma = getDatabaseClient();

  constructor() {
    this.processor = new MedallionDataProcessor();
    this.csvImportService = new CSVImportService();
  }

  /**
   * Import CSV file into Bronze layer with new medallion format
   * Expected CSV columns: Num_equipement, Systeme, Description, Date de détéction de l'anomalie, 
   * Description de l'équipement, Section propriétaire, Fiabilité Intégrité, Disponibilté, Process Safety, Criticité
   */
  async importCSVFile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Importing CSV file into Bronze layer (Medallion Architecture)');

    try {
      const data = await request.file();
      
      if (!data) {
        reply.code(400);
        return {
          success: false,
          message: 'No file uploaded',
          error: 'File is required'
        };
      }

      // Check if it's a CSV file
      if (!data.filename?.endsWith('.csv')) {
        reply.code(400);
        return {
          success: false,
          message: 'Invalid file type. Only CSV files are allowed.',
          error: 'File must be a .csv file'
        };
      }

      // Validate file size (max 10MB)
      const buffer = await data.toBuffer();
      if (buffer.length > 10 * 1024 * 1024) {
        reply.code(400);
        return {
          success: false,
          message: 'File too large. Maximum size is 10MB.',
          error: 'File size exceeds limit'
        };
      }

      const result = await this.csvImportService.importAnomaliesFromUploadedFile(buffer);

      reply.code(200);
      return {
        success: result.success,
        message: `CSV file import completed. ${result.successCount}/${result.totalRows} records imported into Bronze layer.`,
        result: {
          ...result,
          nextSteps: [
            'Run Bronze to Silver processing to clean and validate data',
            'Run Silver to Gold processing to create business-ready anomalies',
            'Or use the complete pipeline endpoint to run all steps'
          ]
        }
      };

    } catch (error) {
      logger.error('Failed to import CSV file:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to import CSV file',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Import sample data into Bronze layer
   */
  async importSampleData(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Importing sample data into Bronze layer');

    try {
      const result = await this.csvImportService.importSampleData();

      reply.code(200);
      return {
        success: result.success,
        message: `Sample data import completed. ${result.successCount}/${result.totalRows} records imported into Bronze layer.`,
        result
      };

    } catch (error) {
      logger.error('Failed to import sample data:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to import sample data',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process data from Bronze to Silver layer
   * Filters nulls/empties and removes duplicates
   */
  async processBronzeToSilver(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Processing Bronze to Silver layer');

    try {
      const result = await this.processor.processBronzeToSilver();

      reply.code(200);
      return {
        success: result.success,
        message: `Bronze to Silver processing completed. ${result.recordsSucceeded}/${result.recordsProcessed} records processed successfully.`,
        result: {
          ...result,
          duplicatesSkipped: result.metadata?.duplicatesSkipped || 0,
          nextStep: 'Run Silver to Gold processing to create business-ready anomalies'
        }
      };

    } catch (error) {
      logger.error('Failed to process Bronze to Silver:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to process Bronze to Silver layer',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process data from Silver to Gold layer (creates/updates Anomaly records)
   */
  async processSilverToGold(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Processing Silver to Gold layer');

    try {
      const result = await this.processor.processSilverToGold();

      reply.code(200);
      return {
        success: result.success,
        message: `Silver to Gold processing completed. ${result.recordsSucceeded}/${result.recordsProcessed} anomalies created/updated in the Gold layer.`,
        result: {
          ...result,
          note: 'Anomalies are now available in the main anomaly management system'
        }
      };

    } catch (error) {
      logger.error('Failed to process Silver to Gold:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to process Silver to Gold layer',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Run complete medallion pipeline: Bronze -> Silver -> Gold
   */
  async runCompletePipeline(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Running complete medallion pipeline');

    try {
      const result = await this.processor.runCompletePipeline();

      const totalProcessed = result.bronzeToSilver.recordsProcessed;
      const silverRecords = result.bronzeToSilver.recordsSucceeded;
      const goldRecords = result.silverToGold.recordsSucceeded;
      const duplicatesSkipped = result.bronzeToSilver.metadata?.duplicatesSkipped || 0;

      reply.code(200);
      return {
        success: result.success,
        message: `Complete medallion pipeline executed successfully. ${totalProcessed} Bronze records processed, ${silverRecords} Silver records created, ${goldRecords} Gold anomalies created/updated.`,
        result: {
          ...result,
          summary: {
            bronzeRecordsProcessed: totalProcessed,
            silverRecordsCreated: silverRecords,
            goldAnomaliesCreated: goldRecords,
            duplicatesSkipped,
            pipelineSuccess: result.success
          }
        }
      };

    } catch (error) {
      logger.error('Failed to run complete pipeline:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to run complete medallion pipeline',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Import CSV and run complete pipeline in one operation
   */
  async importAndProcess(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Import CSV and run complete pipeline');

    try {
      // First import the CSV
      const importResult = await this.importCSVFile(request, reply);
      
      if (!importResult.success) {
        return importResult; // Return import error
      }

      // Wait a moment for database consistency
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Then run the complete pipeline
      const pipelineResult = await this.processor.runCompletePipeline();

      reply.code(200);
      return {
        success: pipelineResult.success,
        message: `CSV import and complete pipeline executed successfully. ${importResult.result.successCount} records imported, ${pipelineResult.silverToGold.recordsSucceeded} anomalies created in Gold layer.`,
        result: {
          import: importResult.result,
          pipeline: pipelineResult,
          summary: {
            csvRecordsImported: importResult.result.successCount,
            anomaliesCreated: pipelineResult.silverToGold.recordsSucceeded,
            totalSuccess: importResult.success && pipelineResult.success
          }
        }
      };

    } catch (error) {
      logger.error('Failed to import and process:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to import CSV and run pipeline',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get Bronze layer statistics
   */
  async getBronzeStats(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Getting Bronze layer statistics');

    try {
      const [totalRecords, processedRecords, recentImports] = await Promise.all([
        this.prisma.bronzeAnomaliesRaw.count(),
        this.prisma.bronzeAnomaliesRaw.count({ where: { isProcessed: true } }),
        this.prisma.bronzeAnomaliesRaw.findMany({
          take: 5,
          orderBy: { ingestedAt: 'desc' },
          select: {
            id: true,
            sourceFile: true,
            ingestedAt: true,
            isProcessed: true
          }
        })
      ]);

      const unprocessedRecords = totalRecords - processedRecords;

      reply.code(200);
      return {
        totalRecords,
        processedRecords,
        unprocessedRecords,
        recentImports
      };

    } catch (error) {
      logger.error('Failed to get Bronze statistics:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve Bronze layer statistics'
      };
    }
  }

  /**
   * Get Silver layer statistics
   */
  async getSilverStats(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Getting Silver layer statistics');

    try {
      const [totalRecords, avgQualityScore, statusStats, sectionStats] = await Promise.all([
        this.prisma.silverAnomaliesClean.count(),
        this.prisma.silverAnomaliesClean.aggregate({
          _avg: { dataQualityScore: true }
        }),
        this.prisma.silverAnomaliesClean.groupBy({
          by: ['statusCategory'],
          _count: { statusCategory: true }
        }),
        this.prisma.silverAnomaliesClean.groupBy({
          by: ['sectionProprietaire'],
          _count: { sectionProprietaire: true }
        })
      ]);

      const statusDistribution = statusStats.reduce((acc: any, stat) => {
        acc[stat.statusCategory || 'UNKNOWN'] = stat._count.statusCategory;
        return acc;
      }, {});

      const sectionDistribution = sectionStats.reduce((acc: any, stat) => {
        acc[stat.sectionProprietaire || 'UNKNOWN'] = stat._count.sectionProprietaire;
        return acc;
      }, {});

      reply.code(200);
      return {
        totalRecords,
        dataQualityScore: Math.round((avgQualityScore._avg.dataQualityScore || 0) * 100) / 100,
        statusDistribution,
        sectionDistribution
      };

    } catch (error) {
      logger.error('Failed to get Silver statistics:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve Silver layer statistics'
      };
    }
  }

  /**
   * Get Gold layer analytics summary
   */
  async getAnalyticsSummary(
    request: FastifyRequest<{ Querystring: { period?: string } }>,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Getting Gold layer analytics summary');

    try {
      const { period } = request.query;
      const currentPeriod = period || this.getCurrentReportPeriod();

      const [anomalySummaries, equipmentHealth, sectionPerformance] = await Promise.all([
        this.prisma.goldAnomalySummary.findMany({
          where: { reportPeriod: currentPeriod },
          orderBy: [
            { sectionCode: 'asc' },
            { totalAnomalies: 'desc' }
          ]
        }),
        this.prisma.goldEquipmentHealth.findMany({
          where: { reportPeriod: currentPeriod },
          orderBy: { healthScore: 'asc' },
          take: 10 // Top 10 equipment with lowest health scores
        }),
        this.prisma.goldSectionPerformance.findMany({
          where: { reportPeriod: currentPeriod },
          orderBy: { overallHealthScore: 'asc' }
        })
      ]);

      reply.code(200);
      return {
        period: currentPeriod,
        anomalySummaries,
        equipmentHealth,
        sectionPerformance
      };

    } catch (error) {
      logger.error('Failed to get analytics summary:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve analytics summary'
      };
    }
  }

  /**
   * Get processing logs
   */
  async getProcessingLogs(
    request: FastifyRequest<{ Querystring: { limit?: number; jobName?: string } }>,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Getting processing logs');

    try {
      const { limit = 20, jobName } = request.query;
      
      const whereClause = jobName ? { jobName } : {};

      const [logs, total] = await Promise.all([
        this.prisma.dataProcessingLog.findMany({
          where: whereClause,
          orderBy: { startTime: 'desc' },
          take: limit
        }),
        this.prisma.dataProcessingLog.count({ where: whereClause })
      ]);

      reply.code(200);
      return {
        logs,
        total,
        limit
      };

    } catch (error) {
      logger.error('Failed to get processing logs:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve processing logs'
      };
    }
  }

  /**
   * Get current report period in YYYY-MM format
   */
  private getCurrentReportPeriod(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  // DEBUG METHODS
  
  /**
   * Get all tables content for debugging
   */
  async getAllTablesContent(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Getting all tables content for debugging');

    try {
      const { limit = 10 } = request.query;

      // Fetch all tables, always as arrays
      const [bronzeAnomalies, bronzeEquipment, silverAnomalies, silverEquipment, silverSections, goldAnomalySummaries, goldEquipmentHealth, goldSectionPerformance, processingLogs, users] = await Promise.all([
        this.prisma.bronzeAnomaliesRaw.findMany({ take: limit }),
        this.prisma.bronzeEquipmentRaw.findMany({ take: limit }),
        this.prisma.silverAnomaliesClean.findMany({ take: limit }),
        this.prisma.silverEquipmentClean.findMany({ take: limit }),
        this.prisma.silverSectionClean.findMany({ take: limit }),
        this.prisma.goldAnomalySummary.findMany({ take: limit }),
        this.prisma.goldEquipmentHealth.findMany({ take: limit }),
        this.prisma.goldSectionPerformance.findMany({ take: limit }),
        this.prisma.dataProcessingLog.findMany({ take: limit, orderBy: { startTime: 'desc' } }),
        this.prisma.user.findMany({ take: limit, select: { id: true, email: true, role: true, createdAt: true } })
      ]);

      // Log the actual data for debugging
      logger.debug('Bronze anomalies:', bronzeAnomalies);
      logger.debug('Bronze equipment:', bronzeEquipment);
      logger.debug('Silver anomalies:', silverAnomalies);
      logger.debug('Silver equipment:', silverEquipment);
      logger.debug('Silver sections:', silverSections);
      logger.debug('Gold anomaly summaries:', goldAnomalySummaries);
      logger.debug('Gold equipment health:', goldEquipmentHealth);
      logger.debug('Gold section performance:', goldSectionPerformance);
      logger.debug('Processing logs:', processingLogs);
      logger.debug('Users:', users);

      reply.code(200);
      return {
        bronze: {
          anomalies: bronzeAnomalies,
          equipment: bronzeEquipment
        },
        silver: {
          anomalies: silverAnomalies,
          equipment: silverEquipment,
          sections: silverSections
        },
        gold: {
          anomalySummaries: goldAnomalySummaries,
          equipmentHealth: goldEquipmentHealth,
          sectionPerformance: goldSectionPerformance
        },
        logs: processingLogs,
        users: users,
        metadata: {
          limit,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      logger.error('Failed to get all tables content:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve tables content'
      };
    }
  }

  /**
   * Get Bronze layer table contents
   */
  async getBronzeTableContent(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Getting Bronze layer table contents');

    try {
      const [anomalies, equipment] = await Promise.all([
        this.prisma.bronzeAnomaliesRaw.findMany({
          orderBy: { ingestedAt: 'desc' },
          take: 20
        }),
        this.prisma.bronzeEquipmentRaw.findMany({
          orderBy: { ingestedAt: 'desc' },
          take: 20
        })
      ]);

      reply.code(200);
      return {
        anomalies,
        equipment,
        counts: {
          totalAnomalies: await this.prisma.bronzeAnomaliesRaw.count(),
          totalEquipment: await this.prisma.bronzeEquipmentRaw.count()
        }
      };

    } catch (error) {
      logger.error('Failed to get Bronze table content:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve Bronze layer content'
      };
    }
  }

  /**
   * Get Silver layer table contents
   */
  async getSilverTableContent(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Getting Silver layer table contents');

    try {
      const [anomalies, equipment, sections] = await Promise.all([
        this.prisma.silverAnomaliesClean.findMany({
          orderBy: { processedAt: 'desc' },
          take: 20
        }),
        this.prisma.silverEquipmentClean.findMany({
          orderBy: { processedAt: 'desc' },
          take: 20
        }),
        this.prisma.silverSectionClean.findMany({
          orderBy: { processedAt: 'desc' },
          take: 20
        })
      ]);

      reply.code(200);
      return {
        anomalies,
        equipment,
        sections,
        counts: {
          totalAnomalies: await this.prisma.silverAnomaliesClean.count(),
          totalEquipment: await this.prisma.silverEquipmentClean.count(),
          totalSections: await this.prisma.silverSectionClean.count()
        }
      };

    } catch (error) {
      logger.error('Failed to get Silver table content:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve Silver layer content'
      };
    }
  }

  /**
   * Get Gold layer table contents
   */
  async getGoldTableContent(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Getting Gold layer table contents');

    try {
      const [anomalySummaries, equipmentHealth, sectionPerformance] = await Promise.all([
        this.prisma.goldAnomalySummary.findMany({
          orderBy: { lastUpdated: 'desc' },
          take: 20
        }),
        this.prisma.goldEquipmentHealth.findMany({
          orderBy: { lastUpdated: 'desc' },
          take: 20
        }),
        this.prisma.goldSectionPerformance.findMany({
          orderBy: { lastUpdated: 'desc' },
          take: 20
        })
      ]);

      reply.code(200);
      return {
        anomalySummaries,
        equipmentHealth,
        sectionPerformance,
        counts: {
          totalAnomalySummaries: await this.prisma.goldAnomalySummary.count(),
          totalEquipmentHealth: await this.prisma.goldEquipmentHealth.count(),
          totalSectionPerformance: await this.prisma.goldSectionPerformance.count()
        }
      };

    } catch (error) {
      logger.error('Failed to get Gold table content:', error);
      reply.code(500);
      return {
        error: 'Failed to retrieve Gold layer content'
      };
    }
  }

  /**
   * Get Bronze layer tables for debug endpoint
   */
  async getBronzeDebugTables(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ): Promise<any> {
    const { limit = 10 } = request.query;
    try {
      const [anomalies, equipment] = await Promise.all([
        this.prisma.bronzeAnomaliesRaw.findMany({ take: limit }),
        this.prisma.bronzeEquipmentRaw.findMany({ take: limit })
      ]);
      reply.code(200);
      return { anomalies, equipment };
    } catch (error) {
      logger.error('Failed to get Bronze debug tables:', error);
      reply.code(500);
      return { error: 'Failed to retrieve Bronze debug tables' };
    }
  }

  /**
   * Get Silver layer tables for debug endpoint
   */
  async getSilverDebugTables(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ): Promise<any> {
    const { limit = 10 } = request.query;
    try {
      const [anomalies, equipment, sections] = await Promise.all([
        this.prisma.silverAnomaliesClean.findMany({ take: limit }),
        this.prisma.silverEquipmentClean.findMany({ take: limit }),
        this.prisma.silverSectionClean.findMany({ take: limit })
      ]);
      reply.code(200);
      return { anomalies, equipment, sections };
    } catch (error) {
      logger.error('Failed to get Silver debug tables:', error);
      reply.code(500);
      return { error: 'Failed to retrieve Silver debug tables' };
    }
  }

  /**
   * Get Gold layer tables for debug endpoint
   */
  async getGoldDebugTables(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ): Promise<any> {
    const { limit = 10 } = request.query;
    logger.info('getGoldDebugTables called');
    try {
      const anomalies = await this.prisma.goldAnomalies.findMany({ take: limit });
      logger.info(`Returning ${anomalies.length} gold anomalies`);
      reply.code(200);
      return { anomalies, equipmentHealth: [], sectionPerformance: [] };
    } catch (error) {
      logger.error('Failed to get Gold debug tables:', error);
      reply.code(200); // Always return 200 for debug, but with empty arrays and error
      return { anomalies: [], equipmentHealth: [], sectionPerformance: [], error: 'Failed to retrieve Gold debug tables' };
    }
  }

  /**
   * Get processing logs for debug endpoint
   */
  async getLogsDebugTable(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ): Promise<any> {
    const { limit = 10 } = request.query;
    try {
      const logs = await this.prisma.dataProcessingLog.findMany({ take: limit, orderBy: { startTime: 'desc' } });
      reply.code(200);
      return logs;
    } catch (error) {
      logger.error('Failed to get logs debug table:', error);
      reply.code(500);
      return { error: 'Failed to retrieve logs debug table' };
    }
  }

  /**
   * Get users table for debug endpoint
   */
  async getUsersDebugTable(
    request: FastifyRequest<{ Querystring: { limit?: number } }>,
    reply: FastifyReply
  ): Promise<any> {
    const { limit = 10 } = request.query;
    try {
      const users = await this.prisma.user.findMany({ take: limit, select: { id: true, email: true, role: true, createdAt: true } });
      reply.code(200);
      return users;
    } catch (error) {
      logger.error('Failed to get users debug table:', error);
      reply.code(500);
      return { error: 'Failed to retrieve users debug table' };
    }
  }
} 