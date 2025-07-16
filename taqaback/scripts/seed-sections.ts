import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parse';

const prisma = new PrismaClient();

interface SectionData {
  Section_Code: string;
}

async function clearSections() {
  console.log('Clearing sections data...');
  await prisma.department.deleteMany({});
  console.log('Sections data cleared.');
}

async function seedSections() {
  try {
    // Clear existing data
    await clearSections();

    // Read and parse CSV file
    const csvFilePath = path.join(__dirname, '../test/seedData/unique_sections.csv');
    const fileContent = await fs.promises.readFile(csvFilePath, 'utf-8');
    
    const records: SectionData[] = await new Promise((resolve, reject) => {
      csv.parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    console.log(`Found ${records.length} sections to import`);

    // Process all sections
    await Promise.all(
      records.map(async (record) => {
        if (!record.Section_Code) {
          console.warn('Skipping invalid record:', record);
          return;
        }

        try {
          await prisma.department.create({
            data: {
              name: record.Section_Code,
              code: record.Section_Code,
              description: `Department ${record.Section_Code}`,
              isActive: true
            }
          });
        } catch (error) {
          console.error(`Error importing section ${record.Section_Code}:`, error);
        }
      })
    );

    console.log('Sections data seeded successfully');
  } catch (error) {
    console.error('Error seeding sections data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Only run if called directly (not imported)
if (require.main === module) {
  seedSections()
    .catch((error) => {
      console.error('Failed to seed sections:', error);
      process.exit(1);
    });
} 