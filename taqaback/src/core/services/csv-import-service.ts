import { PrismaClient } from '@prisma/client';
import { getDatabaseClient } from '../database/client';
import { createLogger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

const logger = createLogger('CSVImportService');

/**
 * Service to import CSV data into the Bronze layer (Medallion Architecture)
 */
export class CSVImportService {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = getDatabaseClient();
  }

  /**
   * Import anomaly data from uploaded file into Bronze layer
   */
  async importAnomaliesFromUploadedFile(fileData: any): Promise<ImportResult> {
    logger.info('Starting CSV import from uploaded file');

    try {
      // Convert buffer to string
      const csvContent = fileData.toString('utf-8');
      const fileName = 'uploaded_file.csv';

      return await this.processCSVContent(csvContent, fileName);

    } catch (error) {
      logger.error('CSV import from uploaded file failed:', error);
      throw error;
    }
  }

  /**
   * Import anomaly data from CSV file into Bronze layer
   */
  async importAnomaliesFromCSV(csvFilePath: string): Promise<ImportResult> {
    logger.info(`Starting CSV import from: ${csvFilePath}`);

    try {
      // Check if file exists
      if (!fs.existsSync(csvFilePath)) {
        throw new Error(`CSV file not found: ${csvFilePath}`);
      }

      // Read and parse CSV file
      const csvContent = fs.readFileSync(csvFilePath, 'utf-8');
      const fileName = path.basename(csvFilePath);

      return await this.processCSVContent(csvContent, fileName);

    } catch (error) {
      logger.error('CSV import failed:', error);
      throw error;
    }
  }

  /**
   * Process CSV content (shared logic for file and upload)
   */
  private async processCSVContent(csvContent: string, fileName: string): Promise<ImportResult> {
    const jobName = 'csv_import_to_bronze';
    
    // Start processing log
    const processingLog = await this.prisma.dataProcessingLog.create({
      data: {
        jobName,
        sourceLayer: null, // External source
        targetLayer: 'bronze',
        recordsProcessed: 0,
        recordsSucceeded: 0,
        recordsFailed: 0,
        startTime: new Date(),
        status: 'RUNNING',
        metadata: {
          fileName,
          operation: 'csv_import'
        }
      }
    });

    try {
    const lines = csvContent.split('\n');
    
    if (lines.length < 2) {
      throw new Error('CSV file appears to be empty or has no data rows');
    }

    // Parse header
    const header = this.parseCSVLine(lines[0]);
    logger.info(`CSV header parsed: ${header.join(', ')}`);

      // Expected columns based on the actual CSV structure
    const expectedColumns = [
      'Num_equipement',
      'Systeme',
      'Description',
      'Date de détéction de l\'anomalie',  // Support both with and without accent
      'Date de detection de l\'anomalie',  // Fallback without accent
      'Description de l\'équipement',
      'Description equipement',            // Fallback without accent
      'Section propriétaire',
      'Section proprietaire',              // Fallback without accent
      'Fiabilité Intégrité',
      'Disponibilté',
      'Process Safety',
      'Criticité',
      'Statut',
      'Priorité'
    ];

    // Map header to our expected columns
    const columnMapping = this.mapCSVColumns(header, expectedColumns);

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    // Process data rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      try {
        const values = this.parseCSVLine(line);
        if (values.length === 0) continue;

        // Map values to our bronze table structure
        const anomalyData = this.mapCSVRowToAnomalyData(values, columnMapping, fileName);

        // Insert into bronze layer
        await this.prisma.bronzeAnomaliesRaw.create({
          data: anomalyData
        });

        successCount++;

      } catch (error) {
        errorCount++;
        const errorMessage = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        logger.warn(errorMessage);
      }
    }

      // Update processing log
      await this.prisma.dataProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          recordsProcessed: lines.length - 1, // Exclude header
          recordsSucceeded: successCount,
          recordsFailed: errorCount,
          endTime: new Date(),
          status: errorCount === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS',
          errorMessage: errors.length > 0 ? errors.slice(0, 5).join('; ') : null
        }
      });

    logger.info(`CSV import completed: ${successCount} succeeded, ${errorCount} failed`);

    return {
      success: errorCount === 0,
      totalRows: lines.length - 1, // Exclude header
      successCount,
      errorCount,
        errors,
        processingLogId: processingLog.id
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

      logger.error('CSV import processing failed:', error);
      throw error;
    }
  }

  /**
   * Parse a CSV line handling quoted values
   */
  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote mode
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // Field separator
        values.push(current.trim());
        current = '';
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    values.push(current.trim());

    return values;
  }

  /**
   * Map CSV header columns to expected structure
   */
  private mapCSVColumns(header: string[], expectedColumns: string[]): ColumnMapping {
    const mapping: ColumnMapping = {};

    // Helper function to normalize text for comparison
    const normalizeText = (text: string): string => {
      return text.toLowerCase()
        .trim()
        .replace(/[àáâãäå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôõö]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[ç]/g, 'c')
        .replace(/[ñ]/g, 'n')
        .replace(/[ýÿ]/g, 'y')
        .replace(/'/g, '')
        .replace(/"/g, '')
        .replace(/\s+/g, ' ');
    };

    expectedColumns.forEach((expectedCol) => {
      const index = header.findIndex(h => {
        // Exact match first
        if (h.trim() === expectedCol) return true;
        
        // Normalized comparison
        const normalizedHeader = normalizeText(h);
        const normalizedExpected = normalizeText(expectedCol);
        
        // Exact normalized match
        if (normalizedHeader === normalizedExpected) return true;
        
        // Partial match (contains)
        return normalizedHeader.includes(normalizedExpected) ||
               normalizedExpected.includes(normalizedHeader);
      });
      
      if (index !== -1) {
        mapping[expectedCol] = index;
      }
    });

    logger.info(`Column mapping: ${JSON.stringify(mapping)}`);
    return mapping;
  }

  /**
   * Map CSV row values to anomaly data structure for Bronze layer
   */
  private mapCSVRowToAnomalyData(values: string[], mapping: ColumnMapping, sourceFile: string): any {
    const fileName = path.basename(sourceFile);

    // Try to get values with fallback options
    const getValueWithFallback = (primaryColumn: string, fallbackColumn?: string): string | null => {
      let value = this.getValueByMapping(values, mapping, primaryColumn);
      if (!value && fallbackColumn) {
        value = this.getValueByMapping(values, mapping, fallbackColumn);
      }
      return value;
    };

    return {
      numEquipement: this.getValueByMapping(values, mapping, 'Num_equipement'),
      systeme: this.getValueByMapping(values, mapping, 'Systeme'),
      description: this.getValueByMapping(values, mapping, 'Description'),
      dateDetectionAnomalie: getValueWithFallback('Date de détéction de l\'anomalie', 'Date de detection de l\'anomalie'),
      descriptionEquipement: getValueWithFallback('Description de l\'équipement', 'Description equipement'),
      sectionProprietaire: getValueWithFallback('Section propriétaire', 'Section proprietaire'),
      fiabiliteIntegrite: this.getValueByMapping(values, mapping, 'Fiabilité Intégrité'),
      disponibilite: this.getValueByMapping(values, mapping, 'Disponibilté'),
      processSafety: this.getValueByMapping(values, mapping, 'Process Safety'),
      criticite: this.getValueByMapping(values, mapping, 'Criticité') || this.getValueByMapping(values, mapping, 'Priorité'), // Prefer Criticité, fallback to Priorité
      sourceFile: fileName,
      rawData: {
        originalValues: values,
        mapping,
        importedAt: new Date().toISOString(),
        csvStructure: 'enhanced_csv_format',
        statut: this.getValueByMapping(values, mapping, 'Statut') // Store additional data
      }
    };
  }

  /**
   * Get value from CSV row using column mapping
   */
  private getValueByMapping(values: string[], mapping: ColumnMapping, columnName: string): string | null {
    const index = mapping[columnName];
    if (index !== undefined && index < values.length) {
      const value = values[index]?.trim();
      return value && value !== '' && value !== 'null' && value !== 'NULL' ? value : null;
    }
    return null;
  }

  /**
   * Import sample data for demonstration
   */
  async importSampleData(): Promise<ImportResult> {
    logger.info('Importing sample anomaly data into Bronze layer');

    const jobName = 'sample_data_import';
    
    // Start processing log
    const processingLog = await this.prisma.dataProcessingLog.create({
      data: {
        jobName,
        sourceLayer: null, // External source
        targetLayer: 'bronze',
        recordsProcessed: 0,
        recordsSucceeded: 0,
        recordsFailed: 0,
        startTime: new Date(),
        status: 'RUNNING',
        metadata: {
          operation: 'sample_data_import'
        }
      }
    });

    try {
    const sampleData = [
      {
          numEquipement: 'EQ-001-TURB-01',
          systeme: 'Turbine',
          description: 'Vibration excessive détectée sur palier principal',
          dateDetectionAnomalie: '2024-01-15 10:30:00',
          descriptionEquipement: 'Turbine à vapeur principale unité 1',
          sectionProprietaire: 'Production',
          fiabiliteIntegrite: '85',
          disponibilite: '92',
          processSafety: '78',
          criticite: 'Haute',
        sourceFile: 'sample_data',
          rawData: { source: 'manual_sample', version: 'medallion_v2' }
      },
      {
          numEquipement: 'EQ-002-COMP-01',
          systeme: 'Compression',
          description: 'Fuite détectée au niveau du joint d\'étanchéité',
          dateDetectionAnomalie: '2024-01-16 14:15:00',
          descriptionEquipement: 'Compresseur centrifuge circuit principal',
          sectionProprietaire: 'Maintenance',
          fiabiliteIntegrite: '72',
          disponibilite: '88',
          processSafety: '95',
          criticite: 'Moyenne',
        sourceFile: 'sample_data',
          rawData: { source: 'manual_sample', version: 'medallion_v2' }
      }
    ];

    let successCount = 0;
    const errors: string[] = [];

    for (const data of sampleData) {
      try {
        await this.prisma.bronzeAnomaliesRaw.create({ data });
        successCount++;
      } catch (error) {
        const errorMessage = `Failed to insert sample data: ${error instanceof Error ? error.message : 'Unknown error'}`;
        errors.push(errorMessage);
        logger.error(errorMessage);
      }
    }

      // Update processing log
      await this.prisma.dataProcessingLog.update({
        where: { id: processingLog.id },
        data: {
          recordsProcessed: sampleData.length,
          recordsSucceeded: successCount,
          recordsFailed: errors.length,
          endTime: new Date(),
          status: errors.length === 0 ? 'COMPLETED' : 'COMPLETED_WITH_ERRORS'
        }
      });

    logger.info(`Sample data import completed: ${successCount}/${sampleData.length} records imported`);

    return {
      success: errors.length === 0,
      totalRows: sampleData.length,
      successCount,
      errorCount: errors.length,
        errors,
        processingLogId: processingLog.id
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

      logger.error('Sample data import failed:', error);
      throw error;
    }
  }
}

/**
 * Column mapping interface
 */
interface ColumnMapping {
  [key: string]: number;
}

/**
 * Import result interface
 */
export interface ImportResult {
  success: boolean;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: string[];
  processingLogId?: string;
} 