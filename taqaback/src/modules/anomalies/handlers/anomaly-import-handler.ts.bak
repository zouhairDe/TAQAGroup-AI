import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createLogger } from '../../../core/utils/logger';
import { createReadStream } from 'fs';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs/promises';

const logger = createLogger('AnomalyImportHandler');
const prisma = new PrismaClient();

export class AnomalyImportHandler {
  async importFromCsv(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    try {
      const body = request.body as any;
      
      if (!body || !body.csvFile) {
        reply.status(400).send({ error: 'No file uploaded. Please upload a file with field name "csvFile".' });
        return;
      }

      const data = body.csvFile;

      // Check file type and validate
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

      // Create uploads directory if it doesn't exist
      const uploadDir = path.join(process.cwd(), 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });

      // Generate unique filename
      const filename = `${Date.now()}-${data.filename}`;
      const filepath = path.join(uploadDir, filename);

      // Save file to disk
      const buffer = await data.toBuffer();
      await fs.writeFile(filepath, buffer);

      // Get file size
      const stats = await fs.stat(filepath);
      const fileSize = stats.size;

      // Create file record in database
      const fileRecord = await prisma.fileStorage.create({
        data: {
          filename: data.filename || filename,
          path: filepath,
          mimeType: data.mimetype,
          size: fileSize,
          uploadedBy: 'system', // TODO: Get from authenticated user
          status: 'active',
          entityType: 'anomaly_import',
          entityId: null,
          isPublic: false,
          description: `Imported anomaly data from ${fileExtension.toUpperCase()} file`,
          metadata: {
            originalFilename: data.filename,
            fileExtension,
            uploadTimestamp: new Date().toISOString(),
            processingStatus: 'pending'
          }
        }
      });

      // Start processing in background
      this.processFile(filepath, fileRecord.id, fileExtension).catch((error: Error) => {
        logger.error('Error processing file:', error);
      });

      reply.status(202).send({
        message: 'File uploaded successfully. Processing started.',
        fileId: fileRecord.id,
        filename: data.filename,
        fileType: fileExtension,
        size: fileSize
      });

    } catch (error) {
      logger.error('Error handling file upload:', error instanceof Error ? error.message : 'Unknown error');
      reply.status(500).send({ error: 'Failed to process file upload' });
    }
  }

  private async processFile(filepath: string, fileId: string, fileExtension: string): Promise<void> {
    try {
      logger.info(`Starting to process file: ${filepath} with extension: ${fileExtension}`);

      if (fileExtension === '.csv') {
        await this.processCSVFile(filepath, fileId);
      } else if (['.xlsx', '.xls'].includes(fileExtension)) {
        await this.processExcelFile(filepath, fileId);
      } else {
        throw new Error(`Unsupported file type: ${fileExtension}`);
      }

      logger.info(`Successfully completed processing file: ${filepath}`);
    } catch (error) {
      logger.error(`Error processing file ${filepath}:`, error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  private async processCSVFile(filepath: string, fileId: string): Promise<void> {
    try {
      const records: any[] = [];
      const errors: string[] = [];
      let processedCount = 0;
      let errorCount = 0;
      let lineNumber = 0;
      
      // Create a more resilient parser with enhanced error handling options
      const parser = createReadStream(filepath).pipe(
        parse({
          columns: true,
          skip_empty_lines: true,
          relax_column_count: true, // Allow records with inconsistent column counts
          relax_quotes: true, // Allow unescaped quotes
          skip_records_with_error: true, // Skip malformed records instead of failing
          trim: true, // Trim whitespace
          ltrim: true, // Trim left whitespace
          rtrim: true, // Trim right whitespace
          quote: '"',
          escape: '"',
          comment: '#', // Ignore lines that start with #
          from_line: 1 // Start from the first line (header)
        })
      );

      // Handle parsing errors
      parser.on('error', (error) => {
        errorCount++;
        // Enhance error reporting with line numbers
        const errorMsg = `CSV parsing error on line ${lineNumber || 'unknown'}: ${error.message}`;
        errors.push(errorMsg);
        logger.warn(errorMsg);
      });

      // Track the current line number for better error reporting
      parser.on('readable', () => {
        lineNumber++;
      });

      for await (const record of parser) {
        try {
          // Skip empty records
          if (!record || Object.keys(record).length === 0) {
            logger.debug(`Skipping empty record on line ${lineNumber}`);
            continue;
          }

          // Clean up the record and handle missing fields with multiple possible field names
          const cleanRecord = {
            numEquipement: record.numEquipement || record.num_equipement || '',
            description: record.description || '',
            dateDetectionAnomalie: this.cleanDateField(record.dateDetectionAnomalie || record.date_detection_anomalie || ''),
            descriptionEquipement: record.descriptionEquipement || record.description_equipement || '',
            sectionProprietaire: record.sectionProprietaire || record.section_proprietaire || '',
            criticite: record.criticite || '',
            disponibilite: record.disponibilite || '',
            fiabiliteIntegrite: record.fiabiliteIntegrite || record.fiabilite_integrite || '',
            processSafety: record.processSafety || record.process_safety || '',
            systeme: record.systeme || '',
            equipmentId: record.equipmentId || record.equipment_id || ''
          };

          // Additional validation could go here if needed
          
          // Save to bronze layer
          await prisma.bronzeAnomaliesRaw.create({
            data: {
              numEquipement: cleanRecord.numEquipement,
              description: cleanRecord.description,
              dateDetectionAnomalie: cleanRecord.dateDetectionAnomalie,
              descriptionEquipement: cleanRecord.descriptionEquipement,
              sectionProprietaire: cleanRecord.sectionProprietaire,
              sourceFile: filepath,
              rawData: cleanRecord,
              criticite: cleanRecord.criticite,
              disponibilite: cleanRecord.disponibilite,
              fiabiliteIntegrite: cleanRecord.fiabiliteIntegrite,
              processSafety: cleanRecord.processSafety,
              systeme: cleanRecord.systeme,
              equipmentId: cleanRecord.equipmentId
            }
          });
          
          records.push(cleanRecord);
          processedCount++;
        } catch (dbError) {
          errorCount++;
          const errorMsg = `Error processing record on line ${lineNumber}: ${dbError instanceof Error ? dbError.message : 'Database error'}`;
          errors.push(errorMsg);
          logger.warn(errorMsg);
        }
      }

      // Update file status
      await prisma.fileStorage.update({
        where: { id: fileId },
        data: {
          metadata: {
            recordsProcessed: processedCount,
            recordsSucceeded: processedCount,
            recordsFailed: errorCount,
            errors: errors.slice(0, 10), // Store first 10 errors
            status: errorCount === 0 ? 'completed' : 'completed_with_errors'
          }
        }
      });

      // Create processing log
      await prisma.dataProcessingLog.create({
        data: {
          jobName: 'anomaly_csv_import',
          sourceLayer: 'csv',
          targetLayer: 'bronze',
          recordsProcessed: processedCount + errorCount,
          recordsSucceeded: processedCount,
          recordsFailed: errorCount,
          startTime: new Date(),
          endTime: new Date(),
          status: errorCount === 0 ? 'completed' : 'completed_with_errors',
          errorMessage: errors.length > 0 ? errors.slice(0, 3).join('; ') : null,
          metadata: {
            fileId,
            filename: path.basename(filepath),
            totalErrors: errors.length,
            sampleErrors: errors.slice(0, 5)
          }
        }
      });

      logger.info(`Successfully processed ${processedCount} records from CSV file (${errorCount} errors skipped)`);

      if (errors.length > 0) {
        logger.warn(`CSV processing completed with ${errors.length} errors. Sample errors: ${errors.slice(0, 3).join('; ')}`);
      }

    } catch (error) {
      logger.error('Error processing CSV file:', error instanceof Error ? error.message : 'Unknown error');
      
      // Update file status to error
      await prisma.fileStorage.update({
        where: { id: fileId },
        data: {
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'error'
          }
        }
      });

      // Create error log
      await prisma.dataProcessingLog.create({
        data: {
          jobName: 'anomaly_csv_import',
          sourceLayer: 'csv',
          targetLayer: 'bronze',
          recordsProcessed: 0,
          recordsSucceeded: 0,
          recordsFailed: 1,
          startTime: new Date(),
          endTime: new Date(),
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            fileId,
            filename: path.basename(filepath)
          }
        }
      });

      throw error;
    }
  }

  // Helper function to clean and normalize date fields
  private cleanDateField(dateStr: string): string {
    if (!dateStr) return '';
    
    // Fix common date formatting issues
    try {
      // Handle malformed dates like '2019-05-19:00' instead of '2019-05-19 00:00:00'
      if (dateStr.includes('-') && dateStr.includes(':') && !dateStr.includes(' ')) {
        const parts = dateStr.split(':');
        if (parts.length === 2) {
          return `${parts[0]} ${parts[1]}:00:00`;
        }
      }
      return dateStr;
    } catch (e) {
      logger.warn(`Could not clean date string: ${dateStr}`);
      return dateStr; // Return original if cleaning fails
    }
  }

  private async processExcelFile(filepath: string, fileId: string): Promise<void> {
    try {
      const workbook = XLSX.readFile(filepath);
      const sheetName = workbook.SheetNames[0]; // Use first sheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert sheet to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      if (!jsonData || jsonData.length === 0) {
        throw new Error('Excel file is empty or has no data');
      }

      const records: any[] = [];
      
      for (const record of jsonData) {
        const row = record as any; // Type assertion for accessing dynamic properties
        
        // Save to bronze layer
        await prisma.bronzeAnomaliesRaw.create({
          data: {
            numEquipement: row.numEquipement || row.num_equipement || row['Num Equipement'],
            description: row.description || row.Description,
            dateDetectionAnomalie: row.dateDetectionAnomalie || row.date_detection_anomalie || row['Date Detection Anomalie'],
            descriptionEquipement: row.descriptionEquipement || row.description_equipement || row['Description Equipement'],
            sectionProprietaire: row.sectionProprietaire || row.section_proprietaire || row['Section Proprietaire'],
            sourceFile: filepath,
            rawData: row,
            criticite: row.criticite || row.Criticite,
            disponibilite: row.disponibilite || row.Disponibilite,
            fiabiliteIntegrite: row.fiabiliteIntegrite || row.fiabilite_integrite || row['Fiabilite Integrite'],
            processSafety: row.processSafety || row.process_safety || row['Process Safety'],
            systeme: row.systeme || row.Systeme,
            equipmentId: row.equipmentId || row.equipment_id || row['Equipment ID']
          }
        });
        records.push(row);
      }

      // Update file status
      await prisma.fileStorage.update({
        where: { id: fileId },
        data: {
          metadata: {
            recordsProcessed: records.length,
            status: 'completed',
            sheetName,
            totalSheets: workbook.SheetNames.length
          }
        }
      });

      // Create processing log
      await prisma.dataProcessingLog.create({
        data: {
          jobName: 'anomaly_excel_import',
          sourceLayer: 'excel',
          targetLayer: 'bronze',
          recordsProcessed: records.length,
          recordsSucceeded: records.length,
          recordsFailed: 0,
          startTime: new Date(),
          endTime: new Date(),
          status: 'completed',
          metadata: {
            fileId,
            filename: path.basename(filepath),
            sheetName,
            totalSheets: workbook.SheetNames.length
          }
        }
      });

      logger.info(`Successfully processed ${records.length} records from Excel file`);

    } catch (error) {
      logger.error('Error processing Excel file:', error instanceof Error ? error.message : 'Unknown error');
      
      // Update file status to error
      await prisma.fileStorage.update({
        where: { id: fileId },
        data: {
          metadata: {
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 'error'
          }
        }
      });

      // Create error log
      await prisma.dataProcessingLog.create({
        data: {
          jobName: 'anomaly_excel_import',
          sourceLayer: 'excel',
          targetLayer: 'bronze',
          recordsProcessed: 0,
          recordsSucceeded: 0,
          recordsFailed: 1,
          startTime: new Date(),
          endTime: new Date(),
          status: 'failed',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          metadata: {
            fileId,
            filename: path.basename(filepath)
          }
        }
      });

      throw error;
    }
  }
}
