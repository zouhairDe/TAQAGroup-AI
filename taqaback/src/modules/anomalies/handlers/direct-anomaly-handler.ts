import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { getDatabaseClient } from '../../../core/database/client';
import { createLogger } from '../../../core/utils/logger';
import { AIPredictionService } from '../../../core/services/ai-prediction-service';
import * as XLSX from 'xlsx';

const logger = createLogger('DirectAnomalyHandler');

/**
 * Handler for direct anomaly operations - bypassing medallion architecture
 */
export class DirectAnomalyHandler {
  private readonly prisma: PrismaClient;
  private readonly aiService: AIPredictionService;

  constructor() {
    this.prisma = getDatabaseClient();
    this.aiService = new AIPredictionService();
  }

  /**
   * Import CSV/Excel file directly into Anomaly table
   */
  async importFile(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Starting direct file import to Anomaly table');

    try {
      const body = request.body as any;
      
      if (!body || !body.file) {
        reply.code(400);
        return {
          success: false,
          message: 'No file uploaded',
          error: 'File is required'
        };
      }

      const data = body.file;
      const isExcel = data.filename?.endsWith('.xlsx') || data.filename?.endsWith('.xls');
      const isCsv = data.filename?.endsWith('.csv');

      if (!isExcel && !isCsv) {
        reply.code(400);
        return {
          success: false,
          message: 'Invalid file type. Only CSV and Excel files are allowed.',
          error: 'File must be .csv, .xls, or .xlsx'
        };
      }

      const buffer = await data.toBuffer();
      let records: any[] = [];

      if (isExcel) {
        records = await this.parseExcelFile(buffer);
      } else {
        records = await this.parseCsvFile(buffer.toString('utf-8'));
      }

      const result = await this.saveAnomalies(records, data.filename || 'unknown');

      reply.code(200);
      return {
        success: true,
        message: `File import completed. ${result.successCount}/${result.totalCount} anomalies imported.`,
        result
      };

    } catch (error) {
      logger.error('Failed to import file:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to import file',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Process anomalies that don't have AI predictions yet
   */
  async processAnomaliesWithAI(
    _request: FastifyRequest,
    reply: FastifyReply
  ): Promise<any> {
    logger.info('Starting AI processing for anomalies without predictions');

    try {
      // Find anomalies that don't have AI predictions
      const anomaliesNeedingAI = await this.prisma.anomaly.findMany({
        where: {
          OR: [
            { fiabilite: null },
            { disponibilite: null },
            { processSafety: null },
            { criticite: null }
          ]
        },
        take: 50 // Process in batches of 50
      });

      if (anomaliesNeedingAI.length === 0) {
        reply.code(200);
        return {
          success: true,
          message: 'No anomalies found that need AI processing',
          result: {
            processed: 0,
            updated: 0,
            failed: 0
          }
        };
      }

      logger.info(`Found ${anomaliesNeedingAI.length} anomalies needing AI processing`);

      // Prepare batch for AI prediction
      const predictionBatch = anomaliesNeedingAI.map(anomaly => ({
        anomaly_id: anomaly.id,
        description: anomaly.description,
        equipment_name: anomaly.equipmentIdentifier || anomaly.code,
        equipment_id: anomaly.equipmentIdentifier || anomaly.code
      }));

      // Get AI predictions
      const aiPredictions = await this.aiService.getPredictions(predictionBatch);

      let updatedCount = 0;
      let failedCount = 0;

      // Update anomalies with AI predictions
      for (let i = 0; i < anomaliesNeedingAI.length; i++) {
        const anomaly = anomaliesNeedingAI[i];
        const prediction = aiPredictions.results[i];

        try {
          if (prediction && prediction.status === 'success') {
            const fiabilite = prediction.predictions?.reliability?.score || 0;
            const disponibilite = prediction.predictions?.availability?.score || 0;
            const processSafety = prediction.predictions?.process_safety?.score || 0;
            const criticite = fiabilite + disponibilite + processSafety;

            // Determine criticity level based on your mapping
            let criticityLevel = 'Low';
            if (criticite >= 11) {
              criticityLevel = 'Critical';
            } else if (criticite >= 8) {
              criticityLevel = 'High';
            } else if (criticite >= 4) {
              criticityLevel = 'Medium';
            }

            await this.prisma.anomaly.update({
              where: { id: anomaly.id },
              data: {
                fiabilite: fiabilite,
                disponibilite,
                processSafety,
                criticite: criticite.toString(),
                severity: criticityLevel,
                updatedAt: new Date()
              }
            });

            updatedCount++;
            logger.info(`Updated anomaly ${anomaly.id} with AI predictions: ${criticite} (${criticityLevel})`);
          } else {
            failedCount++;
            logger.warn(`Failed to get AI prediction for anomaly ${anomaly.id}`);
          }
        } catch (error) {
          failedCount++;
          logger.error(`Failed to update anomaly ${anomaly.id}:`, error);
        }
      }

      reply.code(200);
      return {
        success: true,
        message: `AI processing completed. ${updatedCount} anomalies updated, ${failedCount} failed.`,
        result: {
          processed: anomaliesNeedingAI.length,
          updated: updatedCount,
          failed: failedCount,
          aiResponse: {
            status: aiPredictions.status,
            totalAnomalies: aiPredictions.batch_info.total_anomalies,
            successfulPredictions: aiPredictions.batch_info.successful_predictions,
            failedPredictions: aiPredictions.batch_info.failed_predictions
          }
        }
      };

    } catch (error) {
      logger.error('Failed to process anomalies with AI:', error);
      reply.code(500);
      return {
        success: false,
        message: 'Failed to process anomalies with AI',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Parse Excel file to extract anomaly data
   */
  private async parseExcelFile(buffer: Buffer): Promise<any[]> {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    return jsonData.map((row: any) => this.mapRowToAnomaly(row));
  }

  /**
   * Parse CSV file to extract anomaly data
   */
  private async parseCsvFile(csvContent: string): Promise<any[]> {
    const lines = csvContent.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or has no data rows');
    }

    const header = this.parseCSVLine(lines[0]);
    const records: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = this.parseCSVLine(line);
      if (values.length === 0) continue;

      const rowObject: any = {};
      header.forEach((col, index) => {
        rowObject[col] = values[index] || null;
      });

      records.push(this.mapRowToAnomaly(rowObject));
    }

    return records;
  }

  /**
   * Parse a CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  }

  /**
   * Map CSV/Excel row to Anomaly table structure
   */
  private mapRowToAnomaly(row: any): any {
    // Extract existing AI values if present
    const fiabiliteValue = this.parseNumber(row['Fiabilité Intégrité']);
    const disponibiliteValue = this.parseNumber(row['Disponibilté']);
    const processSafetyValue = this.parseNumber(row['Process Safety']);
    const criticiteValue = this.parseNumber(row['Criticité']);

    // Build the description from available fields
    let description = row['Description'] || 'Untitled Anomaly';
    const equipmentDesc = row['Description de l\'équipement'] || row['Description equipement'];
    if (equipmentDesc && equipmentDesc !== description) {
      description += ` - Equipment: ${equipmentDesc}`;
    }

    return {
      code: row['Num_equipement'] || `ANOM-${Date.now()}`,
      title: row['Description'] || 'Untitled Anomaly',
      description: description,
      equipmentIdentifier: row['Num_equipement'] || `EQ-${Date.now()}`,
      equipmentId: null, // We'll match this later if equipment exists
      systeme: row['Systeme'],
      // Set AI fields if they exist in the file
      fiabilite: fiabiliteValue,
      disponibilite: disponibiliteValue,
      processSafety: processSafetyValue,
      criticite: criticiteValue?.toString(),
      // Default values for required fields
      severity: this.calculateSeverityFromCriticite(criticiteValue),
      status: 'OPEN',
      priority: 'MEDIUM',
      category: 'OPERATIONAL',
      origin: 'FILE_IMPORT',
      reportedById: 'cmcvzm4rz0014tn0a8nezifjm', // admin user ID
      reportedAt: this.parseDate(row['Date de détéction de l\'anomalie'] || row['Date de detection de l\'anomalie']) || new Date(),
      aiFactors: []
    };
  }

  /**
   * Calculate severity from criticite value
   */
  private calculateSeverityFromCriticite(criticite: number | null): string {
    if (!criticite) return 'MEDIUM';
    
    if (criticite >= 11) return 'CRITICAL';
    if (criticite >= 8) return 'HIGH';
    if (criticite >= 4) return 'MEDIUM';
    return 'LOW';
  }

  /**
   * Parse number from string, handling nulls
   */
  private parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  /**
   * Parse date from string
   */
  private parseDate(value: any): Date | null {
    if (!value) return null;
    
    try {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Save anomalies to database
   */
  private async saveAnomalies(records: any[], filename: string): Promise<any> {
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const record of records) {
      try {
        // Check if anomaly already exists
        const existing = await this.prisma.anomaly.findFirst({
          where: {
            OR: [
              { code: record.code },
              { equipmentIdentifier: record.equipmentIdentifier }
            ]
          }
        });

        if (existing) {
          // Update existing anomaly
          await this.prisma.anomaly.update({
            where: { id: existing.id },
            data: {
              ...record,
              updatedAt: new Date()
            }
          });
        } else {
          // Create new anomaly
          await this.prisma.anomaly.create({
            data: {
              ...record,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          });
        }

        successCount++;
      } catch (error) {
        failedCount++;
        const errorMsg = `Row with code ${record.code}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMsg);
        logger.error(errorMsg);
      }
    }

    return {
      totalCount: records.length,
      successCount,
      failedCount,
      errors: errors.slice(0, 10), // Return first 10 errors
      filename
    };
  }
}
