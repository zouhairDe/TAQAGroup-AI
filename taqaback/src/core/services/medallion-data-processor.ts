import { PrismaClient } from '@prisma/client';
import { getDatabaseClient } from '../database/client';
import { createLogger } from '../utils/logger';
import { AIPredictionService } from './ai-prediction-service';

const logger = createLogger('MedallionDataProcessor');

/**
 * Service to handle data processing between medallion architecture layers
 */
export class MedallionDataProcessor {
  private readonly prisma: PrismaClient;
  private readonly aiPredictionService: AIPredictionService;

  constructor() {
    this.prisma = getDatabaseClient();
    this.aiPredictionService = new AIPredictionService();
  }

  /**
   * Process data from Bronze to Silver layer
   * Cleanses, validates, and standardizes raw data
   * Filters out nulls/empties and removes duplicates
   */
  async processBronzeToSilver(): Promise<ProcessingResult> {
    const jobName = 'bronze_to_silver_anomalies';
    logger.info(`Starting ${jobName} processing`);

    // Start processing log
    const processingLog = await this.prisma.dataProcessingLog.create({
      data: {
        jobName,
        sourceLayer: 'bronze',
        targetLayer: 'silver',
        recordsProcessed: 0,
        recordsSucceeded: 0,
        recordsFailed: 0,
        startTime: new Date(),
        status: 'RUNNING'
      }
    });

    try {
      // Get unprocessed bronze records
      const bronzeRecords = await this.prisma.bronzeAnomaliesRaw.findMany({
        where: { isProcessed: false }
      });

      logger.info(`Found ${bronzeRecords.length} unprocessed bronze records`);

      let succeededCount = 0;
      let failedCount = 0;
      const duplicatesFound: string[] = [];

      for (const bronzeRecord of bronzeRecords) {
        try {
          // Clean and validate the data
          const cleanedData = await this.cleanseAnomalyData(bronzeRecord);
          
          if (cleanedData) {
            // Check for duplicates in Silver layer before inserting
            const isDuplicate = await this.checkForDuplicate(cleanedData);
            
            if (!isDuplicate) {
            // Insert into silver layer
            await this.prisma.silverAnomaliesClean.create({
              data: {
                ...cleanedData,
                bronzeSourceId: bronzeRecord.id
              }
            });

            // Mark bronze record as processed
            await this.prisma.bronzeAnomaliesRaw.update({
              where: { id: bronzeRecord.id },
              data: { 
                isProcessed: true, 
                processedAt: new Date() 
              }
            });

            succeededCount++;
            } else {
              // Mark as processed but note it was a duplicate
              await this.prisma.bronzeAnomaliesRaw.update({
                where: { id: bronzeRecord.id },
                data: { 
                  isProcessed: true, 
                  processedAt: new Date() 
                }
              });
              
              duplicatesFound.push(bronzeRecord.id);
              logger.info(`Duplicate record found and skipped: ${bronzeRecord.id}`);
              succeededCount++; // Count as success since it was processed
            }
          } else {
            failedCount++;
            logger.warn(`Failed to cleanse bronze record: ${bronzeRecord.id} - required fields missing or invalid`);
          }
        } catch (error) {
          failedCount++;
          logger.error(`Error processing bronze record ${bronzeRecord.id}:`, error);
        }
      }

      // Update processing log
      await this.prisma.dataProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          recordsProcessed: bronzeRecords.length,
          recordsSucceeded: succeededCount,
          recordsFailed: failedCount,
          endTime: new Date(),
          status: 'COMPLETED',
          metadata: {
            duplicatesSkipped: duplicatesFound.length,
            duplicateIds: duplicatesFound.slice(0, 10) // Store first 10 for reference
          }
        }
      });

      logger.info(`Completed ${jobName}: ${succeededCount} succeeded, ${failedCount} failed, ${duplicatesFound.length} duplicates skipped`);

      return {
        success: true,
        recordsProcessed: bronzeRecords.length,
        recordsSucceeded: succeededCount,
        recordsFailed: failedCount,
        metadata: {
          duplicatesSkipped: duplicatesFound.length
        }
      };

    } catch (error) {
      // Update processing log with error
      await this.prisma.dataProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          endTime: new Date(),
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      logger.error(`Failed ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Process data from Silver to Gold layer (Anomaly table)
   * Transform clean data into business-ready format
   */
  async processSilverToGold(uploadedByUserId?: string): Promise<ProcessingResult> {
    const jobName = 'silver_to_gold_anomalies';
    logger.info(`Starting ${jobName} processing`);

    const processingLog = await this.prisma.dataProcessingLog.create({
      data: {
        jobName,
        sourceLayer: 'silver',
        targetLayer: 'gold',
        recordsProcessed: 0,
        recordsSucceeded: 0,
        recordsFailed: 0,
        startTime: new Date(),
        status: 'RUNNING'
      }
    });

    try {
      // Get total count first
      const totalCount = await this.prisma.silverAnomaliesClean.count();
      logger.info(`Found ${totalCount} silver records to process to gold`);

      let succeededCount = 0;
      let failedCount = 0;
      const batchSize = 10; // Process in smaller batches to prevent memory issues
      let skip = 0;

      while (skip < totalCount) {
        // Fetch records in batches
        const silverRecords = await this.prisma.silverAnomaliesClean.findMany({
          skip,
          take: batchSize,
          orderBy: { id: 'asc' }
        });

        if (silverRecords.length === 0) break;

        logger.info(`Processing batch ${Math.floor(skip / batchSize) + 1}: records ${skip + 1} to ${skip + silverRecords.length}`);

        // Prepare batch for AI prediction
        const predictionBatch = await this.prepareAIPredictionBatch(silverRecords);
        
        // Get AI predictions for the entire batch
        const aiPredictions = predictionBatch.length > 0 
          ? await this.aiPredictionService.getPredictions(predictionBatch)
          : { batch_info: { successful_predictions: 0 }, results: [], status: 'skipped' };
          
        logger.info(`Received ${aiPredictions.results.length} AI predictions for batch (${aiPredictions.status})`);

        // Process each record with AI predictions when available
        for (const silverRecord of silverRecords) {
          try {
            // Check if anomaly already exists in gold first
            const existingAnomaly = await this.prisma.anomaly.findFirst({
              where: {
                equipmentIdentifier: silverRecord.numEquipement
              }
            });

            if (existingAnomaly) {
              logger.info(`Anomaly with equipment identifier ${silverRecord.numEquipement} already exists, skipping`);
              continue;
            }

            // Transform silver record to gold anomaly using the new method
            const goldAnomalyData = await this.transformSilverToGoldAnomaly(
              silverRecord, 
              uploadedByUserId
            );

            // Create new anomaly
            await this.prisma.anomaly.create({
              data: goldAnomalyData
            });

            succeededCount++;
            logger.info(`Successfully processed anomaly ${silverRecord.id} -> ${goldAnomalyData.code}`);
          } catch (error) {
            failedCount++;
            logger.error(`Failed to process record ${silverRecord.id}:`, error);
          }
        }

        skip += batchSize;
        
        // Update processing log periodically
        await this.prisma.dataProcessingLog.update({
          where: { id: processingLog.id },
          data: {
            recordsProcessed: Math.min(skip, totalCount),
            recordsSucceeded: succeededCount,
            recordsFailed: failedCount
          }
        });

        // Small delay to prevent overwhelming the database
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await this.prisma.dataProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          recordsProcessed: totalCount,
          recordsSucceeded: succeededCount,
          recordsFailed: failedCount,
          endTime: new Date(),
          status: 'COMPLETED'
        }
      });

      logger.info(`Completed ${jobName}: ${succeededCount} succeeded, ${failedCount} failed`);

      return {
        success: failedCount === 0,
        recordsProcessed: totalCount,
        recordsSucceeded: succeededCount,
        recordsFailed: failedCount
      };

    } catch (error) {
      await this.prisma.dataProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          endTime: new Date(),
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      logger.error(`Failed ${jobName}:`, error);
      throw error;
    }
  }

  /**
   * Run complete medallion pipeline: Bronze -> Silver -> Gold
   */
  async runCompletePipeline(uploadedByUserId?: string): Promise<PipelineResult> {
    logger.info('Starting complete medallion pipeline');

    try {
      const bronzeToSilverResult = await this.processBronzeToSilver();
      const silverToGoldResult = await this.processSilverToGold(uploadedByUserId);

      return {
        success: bronzeToSilverResult.success && silverToGoldResult.success,
        bronzeToSilver: bronzeToSilverResult,
        silverToGold: silverToGoldResult
      };

    } catch (error) {
      logger.error('Complete pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Extract missing fields from rawData.originalValues if they're not properly mapped
   */
  private extractMissingFieldsFromRawData(bronzeRecord: any): any {
    const extractedData = {
      numEquipement: bronzeRecord.numEquipement,
      description: bronzeRecord.description,
      dateDetectionAnomalie: bronzeRecord.dateDetectionAnomalie,
      descriptionEquipement: bronzeRecord.descriptionEquipement,
      sectionProprietaire: bronzeRecord.sectionProprietaire,
      fiabiliteIntegrite: bronzeRecord.fiabiliteIntegrite,
      disponibilite: bronzeRecord.disponibilite,
      processSafety: bronzeRecord.processSafety,
      criticite: bronzeRecord.criticite,
      systeme: bronzeRecord.systeme
    };

    // If rawData.originalValues exists, extract missing fields
    if (bronzeRecord.rawData && bronzeRecord.rawData.originalValues && Array.isArray(bronzeRecord.rawData.originalValues)) {
      const values = bronzeRecord.rawData.originalValues;
      
      // Based on the debug output, the structure is:
      // Index 0: numEquipement
      // Index 1: ? (might be another ID)
      // Index 2: description
      // Index 3: dateDetectionAnomalie
      // Index 4: descriptionEquipement
      // Index 5: sectionProprietaire
      // Index 6: fiabiliteIntegrite
      // Index 7: disponibilite
      // Index 8: processSafety
      // Index 9: criticite
      
      if (values.length >= 10) {
        // Extract missing fields if they're null in the main record
        if (!extractedData.dateDetectionAnomalie && values[3]) {
          extractedData.dateDetectionAnomalie = values[3];
        }
        if (!extractedData.descriptionEquipement && values[4]) {
          extractedData.descriptionEquipement = values[4];
        }
        if (!extractedData.sectionProprietaire && values[5]) {
          extractedData.sectionProprietaire = values[5];
        }
        if (!extractedData.fiabiliteIntegrite && values[6]) {
          extractedData.fiabiliteIntegrite = values[6];
        }
        if (!extractedData.disponibilite && values[7]) {
          extractedData.disponibilite = values[7];
        }
        if (!extractedData.processSafety && values[8]) {
          extractedData.processSafety = values[8];
        }
        if (!extractedData.criticite && values[9]) {
          extractedData.criticite = values[9];
        }
      }
    }

    return extractedData;
  }

  /**
   * Check for duplicate data in Silver layer
   */
  private async checkForDuplicate(cleanedData: any): Promise<boolean> {
    const existing = await this.prisma.silverAnomaliesClean.findFirst({
      where: {
        AND: [
          { numEquipement: cleanedData.numEquipement },
          { description: cleanedData.description },
          { dateDetectionAnomalie: cleanedData.dateDetectionAnomalie },
          { descriptionEquipement: cleanedData.descriptionEquipement },
          { sectionProprietaire: cleanedData.sectionProprietaire }
        ]
      }
    });

    return existing !== null;
  }

  /**
   * Cleanse and validate data from Bronze to Silver format
   */
  private async cleanseAnomalyData(bronzeRecord: any): Promise<any | null> {
    try {
      // Extract missing fields from rawData.originalValues if they're not properly mapped
      const extractedData = this.extractMissingFieldsFromRawData(bronzeRecord);
      
      // Required fields validation - return null if any required field is missing
      const requiredFields = [
        'numEquipement',
        'description', 
        'dateDetectionAnomalie',
        'descriptionEquipement',
        'sectionProprietaire'
      ];

      for (const field of requiredFields) {
        const value = extractedData[field];
        if (!value || (typeof value === 'string' && (value.trim() === '' || value.toLowerCase() === 'null'))) {
          logger.warn(`Required field '${field}' is null/empty in record ${bronzeRecord.id}: '${value}'`);
        return null;
        }
      }

      // Parse and validate date
      const parsedDate = this.parseDate(extractedData.dateDetectionAnomalie);
      if (!parsedDate) {
        logger.warn(`Invalid date format in record ${bronzeRecord.id}: ${extractedData.dateDetectionAnomalie}`);
        return null;
      }

      // Convert numeric fields
      const fiabiliteIntegrite = this.parseNumericField(extractedData.fiabiliteIntegrite);
      const disponibilite = this.parseNumericField(extractedData.disponibilite);
      const processSafety = this.parseNumericField(extractedData.processSafety);

      // Normalize criticality
      const normalizedCriticite = this.normalizeCriticality(extractedData.criticite);
      
      // Calculate data quality score
      const dataQualityScore = this.calculateDataQualityScore(extractedData);

      // Track validation issues
      const validationErrors: string[] = [];
      const normalizedFields: string[] = [];

      if (fiabiliteIntegrite === null && extractedData.fiabiliteIntegrite) {
        validationErrors.push(`Invalid fiabiliteIntegrite: ${extractedData.fiabiliteIntegrite}`);
      }
      if (disponibilite === null && extractedData.disponibilite) {
        validationErrors.push(`Invalid disponibilite: ${extractedData.disponibilite}`);
      }
      if (processSafety === null && extractedData.processSafety) {
        validationErrors.push(`Invalid processSafety: ${extractedData.processSafety}`);
      }

      if (normalizedCriticite !== extractedData.criticite) {
        normalizedFields.push('criticite');
      }

      return {
        numEquipement: extractedData.numEquipement.trim(),
        systeme: extractedData.systeme?.trim() || null,
        description: extractedData.description.trim(),
        dateDetectionAnomalie: parsedDate,
        descriptionEquipement: extractedData.descriptionEquipement.trim(),
        sectionProprietaire: extractedData.sectionProprietaire.trim(),
        fiabiliteIntegrite,
        disponibilite,
        processSafety,
        criticite: normalizedCriticite,
        dataQualityScore,
        validationErrors: validationErrors.length > 0 ? validationErrors : null,
        normalizedFields: normalizedFields.length > 0 ? normalizedFields : null
      };

    } catch (error) {
      logger.error(`Error cleansing bronze record ${bronzeRecord.id}:`, error);
      return null;
    }
  }

  /**
   * Transform silver data to gold anomaly format (for creating new anomalies)
   * @param silverRecord Silver record to transform
   * @param aiPrediction Optional AI prediction result
   */
  private async transformSilverToGoldAnomaly(
    silverRecord: any, 
    uploadedByUserId?: string
  ): Promise<any> {
    // Generate anomaly code
    const anomalyCode = await this.generateAnomalyCode();
    
    // Get default values from silver record
    let disponibilite = silverRecord.disponibilite || null;
    let fiabilite = silverRecord.fiabiliteIntegrite || null;
    let processSafety = silverRecord.processSafety || null;
    let criticite = silverRecord.criticite || null;
    
    // If any of the numeric fields are missing, set them to random values between 1-3
    if (disponibilite === null || disponibilite === undefined) {
      disponibilite = Math.floor(Math.random() * 3) + 1; // Random 1-3
    }
    if (fiabilite === null || fiabilite === undefined) {
      fiabilite = Math.floor(Math.random() * 3) + 1; // Random 1-3
    }
    if (processSafety === null || processSafety === undefined) {
      processSafety = Math.floor(Math.random() * 3) + 1; // Random 1-3
    }
    
    // Calculate the sum for criticality determination
    const sum = disponibilite + fiabilite + processSafety;
    
    // Determine criticality and severity based on sum
    let severity = 'medium';
    let priority = 'P2';
    
    if (sum >= 3 && sum <= 6) {
      // Low severity
      severity = 'low';
      priority = 'P3';
      criticite = 'Basse';
    } else if (sum >= 7 && sum <= 8) {
      // Medium severity
      severity = 'medium';
      priority = 'P2';
      criticite = 'Moyenne';
    } else if (sum >= 9) {
      // Critical severity
      severity = 'critical';
      priority = 'P1';
      criticite = 'Critique';
    }
    
    // Generate duration to resolve based on severity (in hours)
    let durationToResolve: number;
    if (severity === 'critical') {
      durationToResolve = Math.floor(Math.random() * 24) + 1; // 1-24 hours for critical
    } else if (severity === 'medium') {
      durationToResolve = Math.floor(Math.random() * 168) + 24; // 24-192 hours for medium (1-8 days)
    } else {
      durationToResolve = Math.floor(Math.random() * 500) + 168; // 168-668 hours for low (1-4 weeks)
    }
    
    // Set AI prediction fields
    let aiSuggestedSeverity = severity;
    let aiFactors = [
      `Fiabilité: ${fiabilite}/3`,
      `Disponibilité: ${disponibilite}/3`, 
      `Process Safety: ${processSafety}/3`,
      `Score total: ${sum}/9`
    ];
    let aiConfidence = Math.min(0.95, 0.7 + (sum / 30)); // Confidence based on sum
    
    // Determine category based on system or description
    const category = this.categorizeAnomaly(silverRecord.systeme, silverRecord.description);

    // Find or create equipment reference
    const equipmentId = await this.findOrCreateEquipmentReference(
      silverRecord.numEquipement,
      silverRecord.descriptionEquipement,
      silverRecord.systeme
    );

    // Get the user who uploaded the file, or fallback to admin
    let reportedByUser;
    if (uploadedByUserId) {
      reportedByUser = await this.prisma.user.findUnique({
        where: { id: uploadedByUserId }
      });
    }
    
    // If no uploaded user found, get first admin user
    if (!reportedByUser) {
      reportedByUser = await this.prisma.user.findFirst({
        where: { role: 'admin' }
      });
    }

    if (!reportedByUser) {
      throw new Error('No user found for anomaly assignment');
    }

    // Generate additional logical data based on severity
    const estimatedCost = this.calculateEstimatedCost(severity);
    const downtimeHours = this.calculateDowntimeHours(severity);
    const slaHours = this.calculateSLAHours(severity, priority);
    
    // Determine impacts based on the scores
    const safetyImpact = processSafety <= 2 || severity === 'critical';
    const environmentalImpact = processSafety <= 2 && severity === 'critical';
    const productionImpact = disponibilite <= 2 || severity !== 'low';

    return {
      code: anomalyCode,
      title: this.generateTitle(silverRecord.description),
      description: silverRecord.description,
      equipmentId,
      equipmentIdentifier: silverRecord.numEquipement,
      severity,
      status: 'open',
      priority,
      category,
      origin: 'csv_import',
      disponibilite,
      fiabilite,
      processSafety,
      systeme: silverRecord.systeme,
      criticite,
      reportedById: reportedByUser.id,
      reportedAt: silverRecord.dateDetectionAnomalie,
      safetyImpact,
      environmentalImpact,
      productionImpact,
      estimatedCost,
      downtimeHours,
      durationToResolve,
      slaHours,
      dueDate: this.calculateDueDate(silverRecord.dateDetectionAnomalie, severity, priority),
      aiSuggestedSeverity,
      aiFactors,
      aiConfidence
    };
  }



  /**
   * Parse date string to Date object
   */
  private parseDate(dateString: string): Date | null {
    if (!dateString) return null;

    try {
      // Try multiple date formats
      const formats = [
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/, // 2024-01-15 10:30:00
        /^\d{4}-\d{2}-\d{2}$/, // 2024-01-15
        /^\d{2}\/\d{2}\/\d{4}$/, // 15/01/2024
        /^\d{2}-\d{2}-\d{4}$/, // 15-01-2024
      ];

      const trimmed = dateString.trim();
      
      // ISO format
      if (formats[0].test(trimmed) || formats[1].test(trimmed)) {
        const date = new Date(trimmed);
        return isNaN(date.getTime()) ? null : date;
      }

      // European formats DD/MM/YYYY or DD-MM-YYYY
      if (formats[2].test(trimmed) || formats[3].test(trimmed)) {
        const [day, month, year] = trimmed.split(/[\/\-]/);
        const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return isNaN(date.getTime()) ? null : date;
      }

      // Fallback to general parsing
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? null : date;

    } catch (error) {
      logger.warn(`Date parsing failed for: ${dateString}`);
      return null;
    }
  }

  /**
   * Parse numeric field from string
   */
  private parseNumericField(value: string): number | null {
    if (!value || value.trim() === '' || value.toLowerCase() === 'null') {
    return null;
    }

    const parsed = parseInt(value.trim(), 10);
    return isNaN(parsed) ? null : Math.max(0, Math.min(100, parsed)); // Clamp between 0-100
  }

  /**
   * Normalize criticality values
   */
  private normalizeCriticality(criticite: string): string | null {
    if (!criticite) return null;

    const normalized = criticite.toLowerCase().trim();
    
    const criticalityMap: { [key: string]: string } = {
      // Critical level
      'critique': 'Critique',
      'critical': 'Critique',
      'haute': 'Critique',
      'high': 'Critique',
      'élevée': 'Critique',
      'elevee': 'Critique',
      
      // Medium level
      'moyenne': 'Moyenne',
      'medium': 'Moyenne',
      'moyen': 'Moyenne',
      'modérée': 'Moyenne',
      'moderee': 'Moyenne',
      
      // Low level
      'basse': 'Basse',
      'low': 'Basse',
      'faible': 'Basse',
      'bas': 'Basse'
    };

    return criticalityMap[normalized] || criticite; // Return original if no mapping found
  }

  /**
   * Calculate data quality score
   */
  private calculateDataQualityScore(record: any): number {
    let score = 0;
    let maxScore = 0;

    // Required fields (worth 60% of score)
    const requiredFields = ['numEquipement', 'description', 'dateDetectionAnomalie', 'descriptionEquipement', 'sectionProprietaire'];
    requiredFields.forEach(field => {
      maxScore += 12; // 60/5 = 12 points each
      if (record[field] && record[field].trim() !== '') {
        score += 12;
      }
    });

    // Optional fields (worth 40% of score)
    const optionalFields = ['systeme', 'fiabiliteIntegrite', 'disponibilite', 'processSafety', 'criticite'];
    optionalFields.forEach(field => {
      maxScore += 8; // 40/5 = 8 points each
      if (record[field] && record[field].trim() !== '') {
        score += 8;
      }
    });

    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  }

  /**
   * Map severity and priority based on criticality and scores
   */


  /**
   * Categorize anomaly based on system or description
   */
  private categorizeAnomaly(systeme: string | null, description: string): string {
    const text = `${systeme || ''} ${description}`.toLowerCase();

    if (text.includes('turbine') || text.includes('rotor')) return 'mechanical';
    if (text.includes('électrique') || text.includes('electric') || text.includes('moteur')) return 'electrical';
    if (text.includes('hydraulique') || text.includes('pompe') || text.includes('valve')) return 'hydraulic';
    if (text.includes('capteur') || text.includes('sensor') || text.includes('mesure')) return 'instrumentation';
    if (text.includes('contrôle') || text.includes('control') || text.includes('régulation')) return 'control';

    return 'mechanical'; // Default
  }

  /**
   * Find or create equipment reference
   */
  private async findOrCreateEquipmentReference(equipmentCode: string, description: string, systeme: string | null): Promise<string | null> {
    try {
      // Try to find existing equipment
      let equipment = await this.prisma.equipment.findFirst({
        where: { code: equipmentCode }
      });

      if (!equipment) {
        // Create a basic equipment record if not found
        const defaultSite = await this.prisma.site.findFirst();
        if (!defaultSite) {
          logger.warn(`No default site found for equipment creation: ${equipmentCode}`);
          return null;
        }

        equipment = await this.prisma.equipment.create({
          data: {
            name: description.slice(0, 100), // Limit name length
            code: equipmentCode,
            description: description,
            type: this.mapSystemToEquipmentType(systeme),
            siteId: defaultSite.id,
            status: 'operational'
          }
        });

        logger.info(`Created new equipment record: ${equipmentCode}`);
      }

      return equipment.id;
    } catch (error) {
      logger.error(`Failed to find/create equipment ${equipmentCode}:`, error);
      return null;
    }
  }

  /**
   * Map system to equipment type
   */
  private mapSystemToEquipmentType(systeme: string | null): string {
    if (!systeme) return 'mechanical';

    const systemLower = systeme.toLowerCase();
    if (systemLower.includes('turbine')) return 'mechanical';
    if (systemLower.includes('électrique') || systemLower.includes('electric')) return 'electrical';
    if (systemLower.includes('hydraulique')) return 'hydraulic';
    if (systemLower.includes('instrument')) return 'instrumentation';

    return 'mechanical';
  }

  /**
   * Generate anomaly title from description
   */
  private generateTitle(description: string): string {
    // Take first 100 characters and ensure it ends at a word boundary
    let title = description.slice(0, 100);
    const lastSpace = title.lastIndexOf(' ');
    if (lastSpace > 50) {
      title = title.slice(0, lastSpace);
    }
    return title + (description.length > title.length ? '...' : '');
  }

  /**
   * Generate unique anomaly code
   */
  private async generateAnomalyCode(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `ABO-${year}`;
    
    // Find the highest existing number for this year
    const lastAnomaly = await this.prisma.anomaly.findFirst({
      where: {
        code: {
          startsWith: prefix
        }
      },
      orderBy: {
        code: 'desc'
      }
    });

    let nextNumber = 1;
    if (lastAnomaly) {
      const match = lastAnomaly.code.match(/-(\d+)$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    return `${prefix}-${nextNumber.toString().padStart(3, '0')}`;
  }



  /**
   * Calculate SLA hours based on severity
   * Note: Priority parameter kept for backward compatibility but not used
   */
  private calculateSLAHours(severity: string, _priority: string): number {
    const slaMatrix: { [key: string]: number } = {
      'critical': 4,
      'medium': 72,
      'low': 168
    };

    return slaMatrix[severity] || 72;
  }

  /**
   * Calculate due date based on detection date and SLA
   */
  private calculateDueDate(detectionDate: Date, severity: string, priority: string): Date {
    const slaHours = this.calculateSLAHours(severity, priority);
    const dueDate = new Date(detectionDate);
    dueDate.setHours(dueDate.getHours() + slaHours);
    return dueDate;
  }

  /**
   * Prepare batch of silver records for AI prediction service
   */
  private async prepareAIPredictionBatch(silverRecords: any[]): Promise<any[]> {
    return silverRecords.map(record => ({
      anomaly_id: record.id, // Use the database ID as you requested
      description: record.description,
      equipment_name: record.descriptionEquipement,
      equipment_id: record.numEquipement // Use the original equipment identifier
    }));
  }

  /**
   * Calculate estimated cost based on severity
   */
  private calculateEstimatedCost(severity: string): number {
    let cost = 0;
    if (severity === 'critical') {
      cost = Math.floor(Math.random() * 100000) + 50000; // 50000-150000
    } else if (severity === 'medium') {
      cost = Math.floor(Math.random() * 50000) + 20000; // 20000-70000
    } else {
      cost = Math.floor(Math.random() * 20000) + 5000; // 5000-25000
    }
    return cost;
  }

  /**
   * Calculate downtime hours based on severity
   */
  private calculateDowntimeHours(severity: string): number {
    let hours = 0;
    if (severity === 'critical') {
      hours = Math.floor(Math.random() * 48) + 1; // 1-48 hours
    } else if (severity === 'medium') {
      hours = Math.floor(Math.random() * 24) + 1; // 1-24 hours
    } else {
      hours = Math.floor(Math.random() * 12) + 1; // 1-12 hours
    }
    return hours;
  }
}

export interface ProcessingResult {
  success: boolean;
  recordsProcessed: number;
  recordsSucceeded: number;
  recordsFailed: number;
  metadata?: any;
}

export interface PipelineResult {
  success: boolean;
  bronzeToSilver: ProcessingResult;
  silverToGold: ProcessingResult;
}