import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../../../core/utils/logger';
import { MedallionDataProcessor } from '../../../core/services/medallion-data-processor';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises';

const logger = createLogger('EnhancedAnomalyImportHandler');
const prisma = new PrismaClient();

export class EnhancedAnomalyImportHandler {
  private medallionProcessor: MedallionDataProcessor;

  constructor() {
    this.medallionProcessor = new MedallionDataProcessor();
  }

  /**
   * Main import method that implements medallion architecture
   */
  async importFromCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const body = request.body as any;
      
      if (!body || !body.csvFile) {
        reply.status(400).send({ error: 'No file uploaded. Please upload a file with field name "csvFile".' });
        return;
      }

      const data = body.csvFile;

      // Get user from request (if authenticated)
      const userPayload = request.user as any;
      const uploadedByUserId = userPayload?.id || null;

      // Validate file type
      const fileExtension = path.extname(data.filename || '').toLowerCase();
      const isValidFileType = ['.csv', '.xlsx', '.xls'].includes(fileExtension) || 
                              data.mimetype.includes('csv') || 
                              data.mimetype.includes('spreadsheet') ||
                              data.mimetype.includes('excel');

      if (!isValidFileType) {
        reply.status(400).send({ 
          error: 'Invalid file type. Please upload a CSV or Excel file (.csv, .xlsx, .xls).' 
        });
        return;
      }

      // Create uploads directory and save file
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      const filename = `${Date.now()}-${data.filename}`;
      const filepath = path.join(uploadDir, filename);

      const buffer = await data.toBuffer();
      await fs.writeFile(filepath, buffer);

      const stats = await fs.stat(filepath);
      const fileSize = stats.size;

      // Create file record in database
      const fileRecord = await prisma.fileStorage.create({
        data: {
          filename: data.filename || filename,
          path: filepath,
          mimeType: data.mimetype,
          size: fileSize,
          uploadedBy: uploadedByUserId || 'system', // Use authenticated user or fallback to system
          status: 'active',
          entityType: 'anomaly_import_medallion',
          entityId: null,
          isPublic: false,
          description: `Medallion architecture import from ${fileExtension.toUpperCase()} file`,
          metadata: {
            originalFilename: data.filename,
            fileExtension,
            uploadTimestamp: new Date().toISOString(),
            processingStatus: 'pending',
            architecture: 'medallion',
            uploadedByUserId
          }
        }
      });

      // Start medallion processing pipeline in background
      this.processMedallionPipeline(filepath, fileRecord.id, fileExtension, uploadedByUserId).catch((error: Error) => {
        logger.error('Error in medallion processing pipeline:', error);
      });

      reply.status(202).send({
        message: 'File uploaded successfully. Medallion processing pipeline started.',
        fileId: fileRecord.id,
        filename: data.filename,
        fileType: fileExtension,
        size: fileSize,
        pipeline: 'medallion',
        uploadedBy: uploadedByUserId || 'system'
      });

    } catch (error) {
      logger.error('Error handling file upload:', error instanceof Error ? error.message : 'Unknown error');
      reply.status(500).send({ error: 'Failed to process file upload' });
    }
  }

  /**
   * Medallion Architecture Processing Pipeline
   * Bronze -> Silver -> Gold with AI enrichment
   */
  private async processMedallionPipeline(filepath: string, fileId: string, fileExtension: string, uploadedByUserId: string | null): Promise<void> {
    const startTime = new Date();
    
    try {
      logger.info(`Starting medallion processing pipeline for file: ${filepath}`);

      // Create processing log
      const processingLog = await prisma.dataProcessingLog.create({
        data: {
          jobName: 'medallion_anomaly_import',
          sourceLayer: 'raw_file',
          targetLayer: 'gold',
          recordsProcessed: 0,
          recordsSucceeded: 0,
          recordsFailed: 0,
          startTime,
          status: 'running',
          metadata: {
            fileId,
            filepath,
            fileExtension,
            pipeline: 'medallion',
            uploadedByUserId
          }
        }
      });

      // First, process the file into bronze layer
      logger.info('Processing file into bronze layer...');
      const bronzeRecords = await this.processBronzeLayer(filepath, fileExtension);

      // Run the complete medallion pipeline with the uploaded user ID
      logger.info('Running complete medallion pipeline...');
      const pipelineResult = await this.medallionProcessor.runCompletePipeline(uploadedByUserId || undefined);

      // Update processing log
      const endTime = new Date();
      await prisma.dataProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          endTime,
          status: pipelineResult.success ? 'completed' : 'failed',
          recordsProcessed: pipelineResult.bronzeToSilver.recordsProcessed + pipelineResult.silverToGold.recordsProcessed,
          recordsSucceeded: pipelineResult.bronzeToSilver.recordsSucceeded + pipelineResult.silverToGold.recordsSucceeded,
          recordsFailed: pipelineResult.bronzeToSilver.recordsFailed + pipelineResult.silverToGold.recordsFailed,
          metadata: {
            fileId,
            filepath,
            fileExtension,
            pipeline: 'medallion',
            uploadedByUserId,
            bronzeRecords: bronzeRecords.length,
            bronzeToSilver: JSON.parse(JSON.stringify(pipelineResult.bronzeToSilver)),
            silverToGold: JSON.parse(JSON.stringify(pipelineResult.silverToGold)),
            processingTimeMs: endTime.getTime() - startTime.getTime()
          }
        }
      });

      logger.info(`Medallion pipeline completed successfully. Result: ${JSON.stringify(pipelineResult)}`);

    } catch (error) {
      logger.error('Error in medallion processing pipeline:', error);
      
      // Update processing log with error - find by unique criteria
      try {
        const logs = await prisma.dataProcessingLog.findMany({
          where: { 
            jobName: 'medallion_anomaly_import',
            startTime,
            status: 'running'
          },
          orderBy: { startTime: 'desc' },
          take: 1
        });

        if (logs.length > 0) {
          await prisma.dataProcessingLog.update({
            where: { id: logs[0].id },
            data: {
              endTime: new Date(),
              status: 'failed',
              errorMessage: error instanceof Error ? error.message : 'Unknown error'
            }
          });
        }
      } catch (updateError) {
        logger.error('Failed to update processing log:', updateError);
      }

      throw error;
    }
  }

  /**
   * BRONZE LAYER: Save raw data exactly as received
   */
  private async processBronzeLayer(filepath: string, fileExtension: string): Promise<any[]> {
    const records: any[] = [];

    if (fileExtension === '.csv') {
      await this.processBronzeCSV(filepath, records);
    } else if (['.xlsx', '.xls'].includes(fileExtension)) {
      await this.processBronzeExcel(filepath, records);
    }

    logger.info(`Bronze layer processed ${records.length} raw records`);
    return records;
  }

  private async processBronzeCSV(filepath: string, records: any[]): Promise<void> {
    const parser = createReadStream(filepath).pipe(
      parse({
        columns: true,
        skip_empty_lines: true,
        relax_column_count: true,
        relax_quotes: true,
        skip_records_with_error: true,
        trim: true,
        bom: true
      })
    );

    for await (const record of parser) {
      if (!record || Object.keys(record).length === 0) continue;

      // Save to bronze layer exactly as received
      const bronzeRecord = await prisma.bronzeAnomaliesRaw.create({
        data: {
          numEquipement: record.numEquipement || record['Num Equipement'] || record.num_equipement,
          description: record.description || record.Description,
          dateDetectionAnomalie: record.dateDetectionAnomalie || record['Date Detection Anomalie'] || record.date_detection_anomalie,
          descriptionEquipement: record.descriptionEquipement || record['Description Equipement'] || record.description_equipement,
          sectionProprietaire: record.sectionProprietaire || record['Section Proprietaire'] || record.section_proprietaire,
          criticite: record.criticite || record.Criticite || record['Criticité'],
          disponibilite: record.disponibilite || record.Disponibilite || record['Disponibilité'],
          fiabiliteIntegrite: record.fiabiliteIntegrite || record['Fiabilite Integrite'] || record.fiabilite_integrite,
          processSafety: record.processSafety || record['Process Safety'] || record.process_safety,
          systeme: record.systeme || record.Systeme || record['Système'],
          equipmentId: record.equipmentId || record.equipment_id || record['Equipment ID'],
          sourceFile: filepath,
          rawData: record,
          isProcessed: false
        }
      });

      records.push(bronzeRecord);
    }
  }

  private async processBronzeExcel(filepath: string, records: any[]): Promise<void> {
    const workbook = XLSX.readFile(filepath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    for (const record of jsonData) {
      const bronzeRecord = await prisma.bronzeAnomaliesRaw.create({
        data: {
          numEquipement: (record as any).numEquipement || (record as any)['Num Equipement'] || (record as any).num_equipement,
          description: (record as any).description || (record as any).Description,
          dateDetectionAnomalie: (record as any).dateDetectionAnomalie || (record as any)['Date Detection Anomalie'] || (record as any).date_detection_anomalie,
          descriptionEquipement: (record as any).descriptionEquipement || (record as any)['Description Equipement'] || (record as any).description_equipement,
          sectionProprietaire: (record as any).sectionProprietaire || (record as any)['Section Proprietaire'] || (record as any).section_proprietaire,
          criticite: (record as any).criticite || (record as any).Criticite || (record as any)['Criticité'],
          disponibilite: (record as any).disponibilite || (record as any).Disponibilite || (record as any)['Disponibilité'],
          fiabiliteIntegrite: (record as any).fiabiliteIntegrite || (record as any)['Fiabilite Integrite'] || (record as any).fiabilite_integrite,
          processSafety: (record as any).processSafety || (record as any)['Process Safety'] || (record as any).process_safety,
          systeme: (record as any).systeme || (record as any).Systeme || (record as any)['Système'],
          equipmentId: (record as any).equipmentId || (record as any).equipment_id || (record as any)['Equipment ID'],
          sourceFile: filepath,
          rawData: JSON.parse(JSON.stringify(record)),
          isProcessed: false
        }
      });

      records.push(bronzeRecord);
    }
  }

  /**
   * SILVER LAYER: Clean, validate and normalize data
   */
  private async processSilverLayer(bronzeRecords: any[]): Promise<any[]> {
    const silverRecords: any[] = [];

    for (const bronzeRecord of bronzeRecords) {
      try {
        // Clean and validate date
        const cleanedDate = this.parseDate(bronzeRecord.dateDetectionAnomalie);
        
        // Parse numeric fields
        const disponibilite = this.parseNumericField(bronzeRecord.disponibilite);
        const fiabiliteIntegrite = this.parseNumericField(bronzeRecord.fiabiliteIntegrite);
        const processSafety = this.parseNumericField(bronzeRecord.processSafety);

        // Data quality scoring
        let dataQualityScore = 1.0;
        const validationErrors: string[] = [];

        if (!bronzeRecord.numEquipement) {
          dataQualityScore -= 0.3;
          validationErrors.push('Missing equipment number');
        }
        if (!bronzeRecord.description) {
          dataQualityScore -= 0.3;
          validationErrors.push('Missing description');
        }
        if (!cleanedDate) {
          dataQualityScore -= 0.2;
          validationErrors.push('Invalid date format');
        }

        const silverRecord = await prisma.silverAnomaliesClean.create({
          data: {
            numEquipement: bronzeRecord.numEquipement || 'UNKNOWN',
            description: bronzeRecord.description || 'No description provided',
            dateDetectionAnomalie: cleanedDate || new Date(),
            descriptionEquipement: bronzeRecord.descriptionEquipement || '',
            sectionProprietaire: bronzeRecord.sectionProprietaire || '',
            criticite: bronzeRecord.criticite,
            disponibilite,
            fiabiliteIntegrite,
            processSafety,
            systeme: bronzeRecord.systeme,
            equipmentId: bronzeRecord.equipmentId,
            dataQualityScore,
            validationErrors: validationErrors.length > 0 ? validationErrors : undefined,
            bronzeSourceId: bronzeRecord.id,
            normalizedFields: {
              originalDate: bronzeRecord.dateDetectionAnomalie,
              cleanedDate: cleanedDate?.toISOString(),
              originalAvailability: bronzeRecord.disponibilite,
              originalReliability: bronzeRecord.fiabiliteIntegrite,
              originalProcessSafety: bronzeRecord.processSafety
            }
          }
        });

        // Mark bronze record as processed
        await prisma.bronzeAnomaliesRaw.update({
          where: { id: bronzeRecord.id },
          data: { 
            isProcessed: true,
            processedAt: new Date()
          }
        });

        silverRecords.push(silverRecord);

      } catch (error) {
        logger.error(`Error processing bronze record ${bronzeRecord.id}:`, error);
      }
    }

    logger.info(`Silver layer processed ${silverRecords.length} clean records`);
    return silverRecords;
  }

  /**
   * AI PROCESSING: Enhance records missing AI fields
   */
  private async processWithAI(silverRecords: any[]): Promise<any[]> {
    const aiEnrichedRecords: any[] = [];
    const batchSize = 50; // Process in batches

    for (let i = 0; i < silverRecords.length; i += batchSize) {
      const batch = silverRecords.slice(i, i + batchSize);
      
      // Prepare AI request payload
      const aiRequests: any[] = batch.map(record => ({
        anomaly_id: record.id,
        description: record.description,
        equipment_name: record.descriptionEquipement || record.numEquipement,
        equipment_id: record.equipmentId || record.numEquipement
      }));

      try {
        logger.info(`Processing AI batch ${Math.floor(i / batchSize) + 1} with ${aiRequests.length} records`);
        
        const aiResponse = await this.medallionProcessor.getPredictions(aiRequests);
        
        if (aiResponse.status === 'completed' && aiResponse.results.length > 0) {
          for (const result of aiResponse.results) {
            const originalRecord = batch.find(r => r.id === result.anomaly_id);
            if (originalRecord) {
              const mappedFields = this.medallionProcessor.mapPredictionToAnomalyFields(result);
              
              aiEnrichedRecords.push({
                ...originalRecord,
                disponibilite: mappedFields.disponibilite,
                fiabiliteIntegrite: mappedFields.fiabilite,
                processSafety: mappedFields.processSafety,
                criticite: mappedFields.criticite,
                aiSuggestedSeverity: mappedFields.aiSuggestedSeverity,
                aiFactors: mappedFields.aiFactors,
                aiConfidence: mappedFields.aiConfidence,
                aiEnriched: true
              });
            }
          }
        }

      } catch (error) {
        logger.error(`Error in AI processing for batch ${Math.floor(i / batchSize) + 1}:`, error);
        
        // Add records without AI enrichment
        batch.forEach(record => {
          aiEnrichedRecords.push({
            ...record,
            aiEnriched: false
          });
        });
      }
    }

    logger.info(`AI processing completed for ${aiEnrichedRecords.length} records`);
    return aiEnrichedRecords;
  }

  /**
   * GOLD LAYER: Save final enriched data to Anomaly model
   */
  private async processGoldLayer(silverRecords: any[], aiEnrichedRecords: any[], uploadedByUserId: string | null): Promise<{ succeeded: number, failed: number }> {
    let succeeded = 0;
    let failed = 0;

    // Create a map of AI enriched records for quick lookup
    const aiMap = new Map();
    aiEnrichedRecords.forEach(record => {
      aiMap.set(record.id, record);
    });

    for (const silverRecord of silverRecords) {
      try {
        // Get AI enriched data if available
        const aiData = aiMap.get(silverRecord.id);
        
        // Calculate final criticality
        const finalDisponibilite = aiData?.disponibilite || silverRecord.disponibilite || 0;
        const finalFiabilite = aiData?.fiabiliteIntegrite || silverRecord.fiabiliteIntegrite || 0;
        const finalProcessSafety = aiData?.processSafety || silverRecord.processSafety || 0;
        
        const criticitySum = finalDisponibilite + finalFiabilite + finalProcessSafety;
        let finalCriticite: string;
        
        // Updated criticality mapping: 11-15: Critical, 7-10: High, 3-6: Medium, 0-2: Low
        if (criticitySum >= 11) {
          finalCriticite = 'Critique';
        } else if (criticitySum >= 7) {
          finalCriticite = 'Haute';
        } else if (criticitySum >= 3) {
          finalCriticite = 'Moyenne';
        } else {
          finalCriticite = 'Basse';
        }

        // Find or create equipment if equipmentId is provided
        let equipmentId = null;
        if (silverRecord.equipmentId) {
          try {
            const equipment = await prisma.equipment.findFirst({
              where: { 
                OR: [
                  { id: silverRecord.equipmentId },
                  { code: silverRecord.equipmentId }
                ]
              }
            });
            equipmentId = equipment?.id;
          } catch (error) {
            logger.warn(`Equipment not found for ID: ${silverRecord.equipmentId}`);
          }
        }

        // Find or create system user for imports
        let systemUser = await prisma.user.findFirst({
          where: { email: 'system@taqa.com' }
        });

        if (!systemUser) {
          systemUser = await prisma.user.create({
            data: {
              email: 'system@taqa.com',
              name: 'System Import',
              role: 'system',
              password: 'N/A', // System user doesn't need login
              isActive: true
            }
          });
        }

        // Generate unique code
        const anomalyCode = `ANO-${Date.now()}-${silverRecord.numEquipement}`;

        // Create anomaly in gold layer
        const anomaly = await prisma.anomaly.create({
          data: {
            code: `ABO-${Date.now()}`,
            title: silverRecord.description.substring(0, 100),
            description: silverRecord.description,
            equipmentId: equipmentId || undefined,
            equipmentIdentifier: silverRecord.numEquipement,
            severity: this.mapSeverity(finalCriticite),
            status: 'open',
            priority: this.mapPriority(finalCriticite),
            category: silverRecord.systeme || 'general',
            origin: 'import',
            reportedById: uploadedByUserId || systemUser.id,
            reportedAt: silverRecord.dateDetectionAnomalie,
            criticite: finalCriticite,
            disponibilite: finalDisponibilite,
            fiabilite: finalFiabilite,
            processSafety: finalProcessSafety,
            aiSuggestedSeverity: aiData?.aiSuggestedSeverity || undefined,
            aiFactors: aiData?.aiFactors || undefined
          }
        });

        succeeded++;

      } catch (error) {
        logger.error(`Error creating anomaly for silver record ${silverRecord.id}:`, error);
        failed++;
      }
    }

    logger.info(`Gold layer processing completed. Succeeded: ${succeeded}, Failed: ${failed}`);
    return { succeeded, failed };
  }

  // Helper methods
  private parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    
    const cleanedDate = dateStr.trim();
    const date = new Date(cleanedDate);
    
    if (isNaN(date.getTime())) {
      // Try different date formats
      const formats = [
        /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
        /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
        /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
      ];
      
      for (const format of formats) {
        if (format.test(cleanedDate)) {
          const parts = cleanedDate.split(/[-\/]/);
          if (parts.length === 3) {
            // Assume DD/MM/YYYY or DD-MM-YYYY
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Month is 0-indexed
            const year = parseInt(parts[2]);
            const parsedDate = new Date(year, month, day);
            if (!isNaN(parsedDate.getTime())) {
              return parsedDate;
            }
          }
        }
      }
      
      logger.warn(`Could not parse date: ${dateStr}`);
      return null;
    }
    
    return date;
  }

  private parseNumericField(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;
    
    const numValue = Number(value);
    return isNaN(numValue) ? null : Math.round(numValue);
  }

  private mapSeverity(criticite: string): string {
    switch (criticite.toLowerCase()) {
      case 'critique': return 'critical';
      case 'haute': return 'high';
      case 'moyenne': return 'medium';
      case 'basse': return 'low';
      default: return 'medium';
    }
  }

  private mapPriority(criticite: string): string {
    switch (criticite.toLowerCase()) {
      case 'critique': return 'critical';
      case 'haute': return 'high';
      case 'moyenne': return 'medium';
      case 'basse': return 'low';
      default: return 'medium';
    }
  }
} 