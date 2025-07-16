/**
 * TAQA Anomaly Management System - Database Seeder
 * 
 * This script seeds the database with realistic sample data for development and testing.
 * It creates users, teams, sites, equipment, and related data that represents
 * a typical TAQA Morocco industrial facility.
 * 
 * Usage: tsx scripts/db-seeder.ts
 * 
 * @author TAQA Development Team
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import * as csv from 'csv-parse';

const prisma = new PrismaClient();

async function clearExistingData() {
  console.log('🧹 Clearing existing anomaly data...');
  await prisma.bronzeAnomaliesRaw.deleteMany();
  await prisma.silverAnomaliesClean.deleteMany();
  console.log('✅ Existing data cleared');
}

async function parseCSVFile(filePath: string): Promise<any[]> {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return new Promise((resolve, reject) => {
    csv.parse(fileContent, {
      columns: true,
      delimiter: ',',
      skip_empty_lines: true,
    }, (err, records) => {
      if (err) reject(err);
      else resolve(records);
    });
  });
}

async function seedEquipment() {
  try {
    const filePath = path.join(__dirname, '../test/seedData/equipment_list.csv');
    const records = await parseCSVFile(filePath);

    console.log(`Processing ${records.length} equipment records...`);

    for (const record of records) {
      try {
        // Check if equipment already exists
        const existingEquipment = await prisma.equipment.findUnique({
          where: { code: record.Equipment_ID }
        });

        if (!existingEquipment) {
          await prisma.equipment.create({
            data: {
              code: record.Equipment_ID,
              name: record.Equipment_Name,
              type: 'unknown', // You might want to extract this from the name or add to CSV
              status: 'operational',
              siteId: (await prisma.site.findFirst())?.id || '', // Default to first site
              isActive: true
            }
          });
        }
      } catch (error) {
        console.error(`Error processing equipment ${record.Equipment_ID}:`, error);
      }
    }
    console.log('Equipment seeded successfully!');
  } catch (error) {
    console.error('Error seeding equipment:', error);
  }
}

async function seedMaintenanceWindows() {
  try {
    const filePath = path.join(__dirname, '../test/seedData/Maintenace Windows and Actions Plan Template.csv');
    const records = await parseCSVFile(filePath);

    console.log(`Processing ${records.length} maintenance windows...`);

    for (const record of records) {
      try {
        // Parse dates safely
        let startDate: Date;
        let endDate: Date;
        
        try {
          const parsedStartDate = record['Start Date'] ? new Date(record['Start Date']) : null;
          const parsedEndDate = record['End Date'] ? new Date(record['End Date']) : null;
          
          if (!parsedStartDate || !parsedEndDate || isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            console.error('Invalid dates for record:', record);
            continue;
          }
          
          startDate = parsedStartDate;
          endDate = parsedEndDate;
        } catch (e) {
          console.error('Invalid date format in record:', record);
          continue;
        }

        const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

        await prisma.maintenancePeriod.create({
          data: {
            title: record.Title || 'Maintenance Window',
            description: record.Description || `Maintenance window from ${startDate.toISOString()} to ${endDate.toISOString()}`,
            startDate,
            endDate,
            durationDays,
            durationHours: durationDays * 24,
            status: record.Status || 'available',
            type: record.Type || 'maintenance',
            location: record.Location || 'Not specified'
          }
        });
      } catch (error) {
        console.error('Error processing maintenance window:', error);
      }
    }
    console.log('Maintenance windows seeded successfully!');
  } catch (error) {
    console.error('Error seeding maintenance windows:', error);
  }
}

async function seedAnomalies() {
  try {
    const filePath = path.join(__dirname, '../test/seedData/test-file.csv');
    const records = await parseCSVFile(filePath);

    console.log(`Processing ${records.length} anomalies...`);

    for (const record of records) {
      // Create Bronze entry
      const bronzeAnomaly = await prisma.bronzeAnomaliesRaw.create({
        data: {
          numEquipement: record.Num_equipement,
          equipmentId: record.Num_equipement,
          description: record.Description,
          dateDetectionAnomalie: record['Date de detection de l\'anomalie'],
          descriptionEquipement: record['Description equipement'],
          sectionProprietaire: record['Section proprietaire'],
          sourceFile: 'test-file.csv',
          rawData: record,
          isProcessed: true,
          criticite: record.Priorité || null,
          disponibilite: '100',
          fiabiliteIntegrite: '100',
          processSafety: '100',
          systeme: record['Section proprietaire']
        }
      });

      // Create Silver entry
      await prisma.silverAnomaliesClean.create({
        data: {
          numEquipement: record.Num_equipement,
          equipmentId: record.Num_equipement,
          description: record.Description,
          dateDetectionAnomalie: new Date(record['Date de detection de l\'anomalie']),
          descriptionEquipement: record['Description equipement'],
          sectionProprietaire: record['Section proprietaire'],
          dataQualityScore: 1.0,
          bronzeSourceId: bronzeAnomaly.id,
          criticite: record.Priorité || null,
          disponibilite: 100,
          fiabiliteIntegrite: 100,
          processSafety: 100,
          systeme: record['Section proprietaire'],
          normalizedFields: {
            equipment: record['Description equipement'],
            section: record['Section proprietaire'],
            status: record.Statut,
            priority: record.Priorité
          }
        }
      });
    }
    console.log('Anomalies seeded successfully!');
  } catch (error) {
    console.error('Error seeding anomalies:', error);
    throw error;
  }
}

async function seedSections() {
  try {
    const filePath = path.join(__dirname, '../test/seedData/unique_sections.csv');
    const records = await parseCSVFile(filePath);

    console.log(`Processing ${records.length} sections...`);

    for (const record of records) {
      // Check if record.Section exists before using it
      if (record.Section) {
        await prisma.department.create({
          data: {
            name: record.Section,
            code: record.Section.substring(0, 10).toUpperCase().replace(/\s+/g, '_'),
            description: `Department for ${record.Section}`,
            isActive: true
          }
        });
      }
    }
    console.log('Sections seeded successfully!');
  } catch (error) {
    console.error('Error seeding sections:', error);
  }
}

async function main() {
  try {
    // First clear existing data
    await clearExistingData();
    
    // Then seed base data
    await seedSections();
    await seedEquipment();
    await seedMaintenanceWindows();
    
    // Finally seed anomalies which depend on the base data
    await seedAnomalies();
    
    console.log('✅ All data seeded successfully!');
  } catch (error) {
    console.error('Error in main:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
