import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parse';
import { promisify } from 'util';

const prisma = new PrismaClient();

interface EquipmentData {
  Equipment_ID: string;
  Equipment_Name: string;
}

async function clearEquipment() {
  console.log('Clearing equipment data...');
  await prisma.equipment.deleteMany({});
  console.log('Equipment data cleared.');
}

async function getDefaultSiteId(): Promise<string> {
  // First try to get from environment variable
  if (process.env.DEFAULT_SITE_ID) {
    return process.env.DEFAULT_SITE_ID;
  }

  // If not set, try to get the first active site
  const site = await prisma.site.findFirst({
    where: {
      status: 'active'
    }
  });

  if (!site) {
    throw new Error('No active site found. Please run npm run db:seed-site first and set DEFAULT_SITE_ID in .env');
  }

  console.log('Using site:', site.name, '(ID:', site.id, ')');
  return site.id;
}

async function seedEquipment() {
  try {
    // Get site ID first
    const siteId = await getDefaultSiteId();
    console.log('Using site ID:', siteId);

    // Clear existing data
    await clearEquipment();

    // Read and parse CSV file
    const csvFilePath = path.join(__dirname, '../test/seedData/equipment_list.csv');
    const fileContent = await fs.promises.readFile(csvFilePath, 'utf-8');
    
    const records: EquipmentData[] = await new Promise((resolve, reject) => {
      csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    console.log(`Found ${records.length} equipment records to import`);

    let successCount = 0;
    let errorCount = 0;

    // Process records in batches to avoid memory issues
    const batchSize = 100;
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      
      await Promise.all(
        batch.map(async (record) => {
          if (!record.Equipment_ID || !record.Equipment_Name) {
            console.warn('Skipping invalid record:', record);
            return;
          }

          try {
            await prisma.equipment.create({
              data: {
                id: record.Equipment_ID,
                name: record.Equipment_Name,
                code: `EQ-${record.Equipment_ID.slice(0, 8)}`, // Generate a code from ID
                type: 'unknown', // Required field, set default
                status: 'operational', // Required field, set default
                siteId: siteId,
                isActive: true
              }
            });
            successCount++;
          } catch (error) {
            console.error(`Error importing equipment ${record.Equipment_ID}:`, error);
            errorCount++;
          }
        })
      );

      console.log(`Processed ${Math.min(i + batchSize, records.length)} of ${records.length} records`);
    }

    console.log(`Equipment data seeded successfully. Imported: ${successCount}, Failed: ${errorCount}`);
  } catch (error) {
    console.error('Error seeding equipment data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  seedEquipment()
    .catch((error) => {
      console.error('Failed to seed equipment:', error);
      process.exit(1);
    });
} 