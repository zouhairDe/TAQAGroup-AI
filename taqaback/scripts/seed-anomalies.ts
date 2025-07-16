import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import { v4 as uuidv4 } from 'uuid';
import { getRandomValues } from 'crypto';

const prisma = new PrismaClient();

interface AnomalyData {
  Num_equipement: string;
  Systeme: string;
  Description: string;
  'Date de détéction de l\'anomalie': string;
  'Description de l\'équipement': string;
  'Section propriétaire': string;
  'Fiabilité Intégrité': string;
  Disponibilte: string;
  'Process Safety': string;
  Criticité: string;
}



async function clearAnomalies() {
  console.log('Clearing anomalies data...');
  await prisma.anomaly.deleteMany({});
  console.log('Anomalies data cleared.');
}

function generateAnomalyCode(index: number): string {
  return `ANO-${String(index + 1).padStart(6, '0')}`;
}

function mapSeverity(criticite: string): string {
  const value = parseInt(criticite, 10);
  if (value >= 8) return 'critical';
  if (value >= 6) return 'high';
  if (value >= 4) return 'medium';
  return 'low';
}

async function getDefaultUserId(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: {
        email: 'admin@taqa.ma',
        isActive: true
    }
  });

  if (!admin) {
    throw new Error('No active admin user found. Please create an admin user first.');
  }

  return admin.id;
}

function cleanString(str: string | undefined): string {
  if (!str) return '';
  // Remove any non-printable characters
  return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '')
    // Replace multiple spaces with a single space
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim();
}

function parseDate(dateStr: string | undefined): Date {
  if (!dateStr) return new Date();
  
  try {
    // Try parsing as ISO string first
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) return date;

    // Try parsing custom format (assuming DD/MM/YYYY or similar)
    const parts = dateStr.split(/[\/\-\s:]/);
    if (parts.length >= 3) {
      // Assuming day/month/year format
      const day = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // months are 0-based
      const year = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }

    // If all else fails, return current date
    return new Date();
  } catch (error) {
    console.warn('Error parsing date:', dateStr, error);
    return new Date();
  }
}

async function seedAnomalies() {
  try {
    const reportedById = await getDefaultUserId();
    
    // Clear existing data
    await clearAnomalies();

    // Read and parse CSV file
    const csvFilePath = path.join(__dirname, '../test/seedData/full-anomalies-data.csv');
    const fileContent = await fs.promises.readFile(csvFilePath, 'utf-8');
    
    const records: Partial<AnomalyData>[] = await new Promise((resolve, reject) => {
      parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
        relax_quotes: true,
        skip_records_with_error: true,
        quote: '"',
        escape: '"',
        on_record: (record, context) => {
          // Clean and validate each field
          const cleanRecord = Object.entries(record).reduce((acc, [key, value]) => {
            acc[key] = typeof value === 'string' ? cleanString(value) : value;
            return acc;
          }, {} as Record<string, any>);

          return {
            ...cleanRecord,
            Criticité: cleanRecord.Criticité || '1',
            'Process Safety': cleanRecord['Process Safety'] || '1',
            Disponibilte: cleanRecord.Disponibilte || '1',
            'Fiabilité Intégrité': cleanRecord['Fiabilité Intégrité'] || '1'
          };
        }
      }, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    console.log(`Found ${records.length} anomaly records to import`);

    let successCount = 0;
    let errorCount = 0;

    // Process records in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (record, index) => {
          if (!record.Description) {
            console.warn('Skipping invalid record (no description):', record);
            errorCount++;
            return;
          }

          try {
            const severity = mapSeverity(record.Criticité || '1');
            const anomalyData = {
              id: uuidv4(),
              code: generateAnomalyCode(i + index),
              title: cleanString(record.Description).slice(0, 100),
              description: cleanString(record.Description),
              equipmentIdentifier: cleanString(record.Num_equipement) || 'unknown',
              severity,
              status: 'open',
              priority: 'medium',
              category: cleanString(record.Systeme) || 'uncategorized',
              origin: 'import',
              reportedById,
              criticite: record.Criticité,
              disponibilite: parseInt(record.Disponibilte || '1', 10),
              fiabilite: parseInt(record['Fiabilité Intégrité'] || '1', 10),
              processSafety: parseInt(record['Process Safety'] || '1', 10),
              systeme: cleanString(record.Systeme),
              safetyImpact: parseInt(record['Process Safety'] || '1', 10) > 5,
              productionImpact: parseInt(record.Disponibilte || '1', 10) > 5,
              reportedAt: parseDate(record['Date de détéction de l\'anomalie']),
              durationToResolve: Math.floor(Math.random() * 25) + 1
            };

            await prisma.anomaly.create({
              data: anomalyData
            });
            successCount++;
          } catch (error) {
            console.error(`Error importing anomaly record ${i + index}:`, error);
            errorCount++;
          }
        })
      );

      console.log(`Processed ${Math.min(i + batchSize, records.length)} of ${records.length} records`);
    }

    console.log(`Anomalies data seeded successfully. Imported: ${successCount}, Failed: ${errorCount}`);
  } catch (error) {
    console.error('Error seeding anomalies data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  seedAnomalies()
    .catch((error) => {
      console.error('Failed to seed anomalies:', error);
      process.exit(1);
    });
} 