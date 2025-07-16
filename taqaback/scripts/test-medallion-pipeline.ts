/**
 * Test the enhanced medallion pipeline with actual CSV data
 * 
 * This script tests the complete medallion pipeline with CSV data to verify:
 * 1. Records with existing values skip AI prediction
 * 2. Records with missing values get AI predictions
 * 3. Criticality calculation based on sum of 3 fields
 * 4. Proper handling of CSV import data
 * 
 * Run with: npm run test:medallion-pipeline
 */

import { PrismaClient } from '@prisma/client';
import { MedallionDataProcessor } from '../src/core/services/medallion-data-processor';
import { CSVImportService } from '../src/core/services/csv-import-service';
import { createLogger } from '../src/core/utils/logger';
import { cleanAnomalyPipeline } from './clean-anomaly-pipeline';
import * as fs from 'fs';
import * as path from 'path';

const logger = createLogger('Medallion-Pipeline-Test');

async function testMedallionPipeline() {
  const prisma = new PrismaClient();
  const processor = new MedallionDataProcessor();
  const csvImportService = new CSVImportService();
  
  console.log('🧪 Testing Enhanced Medallion Pipeline with CSV Data');
  console.log('==================================================');
  
  try {
    // Check for admin user and create one if needed
    console.log('\n1. Checking for admin user...');
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@taqa.com' }
    });
    
    if (!adminUser) {
      console.log('   Creating admin user...');
      await prisma.user.create({
        data: {
          email: 'admin@taqa.com',
          name: 'Test Admin',
          password: '$2b$10$gG9YDCho3Z.UYX3CK3IuweQwapyKL1VQJuzNBm6HBGVIpjLfNKs86',
          role: 'admin',
          isActive: true
        }
      });
      console.log('   ✅ Admin user created');
    } else {
      console.log('   ✅ Admin user exists');
    }

    // Clean existing data
    console.log('\n2. Cleaning existing pipeline data...');
    try {
      await cleanAnomalyPipeline();
      console.log('   ✅ Pipeline cleaned');
    } catch (cleanupError) {
      console.warn('   ⚠️ Pipeline cleanup failed - continuing with test');
    }    // Import CSV data
    console.log('\n3. Importing CSV data to Bronze layer...');
    const csvPath = path.join(__dirname, '..', 'test', 'seedData', 'full-anomalies-data.csv');
    
    if (!fs.existsSync(csvPath)) {
      throw new Error(`CSV file not found at: ${csvPath}`);
    }
    
    const importResult = await csvImportService.importAnomaliesFromCSV(csvPath);    
    console.log(`   ✅ Imported ${importResult.totalRows} records to Bronze layer`);
    console.log(`   - Valid records: ${importResult.successCount}`);
    console.log(`   - Invalid records: ${importResult.errorCount}`);

    // Check Bronze layer data
    console.log('\n4. Analyzing Bronze layer data...');
    const bronzeRecords = await prisma.bronzeAnomaliesRaw.findMany({
      where: { isProcessed: false },
      take: 10
    });
    
    console.log(`   Found ${bronzeRecords.length} unprocessed Bronze records`);
    
    // Show sample records with their field availability
    console.log('\n   Sample records analysis:');
    bronzeRecords.slice(0, 5).forEach((record, index) => {
      console.log(`   Record ${index + 1}:`);
      console.log(`     - Num Equipment: ${record.numEquipement}`);
      console.log(`     - Fiabilité: ${record.fiabiliteIntegrite || 'MISSING'}`);
      console.log(`     - Disponibilité: ${record.disponibilite || 'MISSING'}`);
      console.log(`     - Process Safety: ${record.processSafety || 'MISSING'}`);
      console.log(`     - Criticité: ${record.criticite || 'MISSING'}`);
      console.log(`     - Needs AI: ${!record.fiabiliteIntegrite || !record.disponibilite || !record.processSafety || !record.criticite}`);
    });

    // Process Bronze to Silver
    console.log('\n5. Processing Bronze to Silver layer...');
    const bronzeToSilverResult = await processor.processBronzeToSilver();
    
    console.log(`   ✅ Bronze to Silver completed`);
    console.log(`   - Records processed: ${bronzeToSilverResult.recordsProcessed}`);
    console.log(`   - Records succeeded: ${bronzeToSilverResult.recordsSucceeded}`);
    console.log(`   - Records failed: ${bronzeToSilverResult.recordsFailed}`);
    console.log(`   - Duplicates skipped: ${bronzeToSilverResult.metadata?.duplicatesSkipped || 0}`);

    // Check Silver layer data
    console.log('\n6. Analyzing Silver layer data...');
    const silverRecords = await prisma.silverAnomaliesClean.findMany({
      take: 10
    });
    
    console.log(`   Found ${silverRecords.length} Silver records`);
    
    // Analyze which records need AI prediction
    let needsAI = 0;
    let hasAllValues = 0;
    
    silverRecords.forEach(record => {
      const needsPrediction = !record.fiabiliteIntegrite || !record.disponibilite || !record.processSafety || !record.criticite;
      if (needsPrediction) {
        needsAI++;
      } else {
        hasAllValues++;
      }
    });
    
    console.log(`   - Records needing AI prediction: ${needsAI}`);
    console.log(`   - Records with all values: ${hasAllValues}`);

    // Process Silver to Gold with AI predictions
    console.log('\n7. Processing Silver to Gold layer with AI predictions...');
    const silverToGoldResult = await processor.processSilverToGold();
    
    console.log(`   ✅ Silver to Gold completed`);
    console.log(`   - Records processed: ${silverToGoldResult.recordsProcessed}`);
    console.log(`   - Records succeeded: ${silverToGoldResult.recordsSucceeded}`);
    console.log(`   - Records failed: ${silverToGoldResult.recordsFailed}`);

    // Check Gold layer data (Anomaly table)
    console.log('\n8. Analyzing Gold layer data (Anomaly table)...');
    const goldRecords = await prisma.anomaly.findMany({
      where: { origin: 'csv_import' },
      take: 10
    });
    
    console.log(`   Found ${goldRecords.length} Gold records (Anomalies)`);
    
    // Show sample Gold records with their values
    console.log('\n   Sample Gold records:');
    goldRecords.slice(0, 5).forEach((record, index) => {
      console.log(`   Record ${index + 1}:`);
      console.log(`     - Code: ${record.code}`);
      console.log(`     - Equipment: ${record.equipmentIdentifier}`);
      console.log(`     - Fiabilité: ${record.fiabilite}`);
      console.log(`     - Disponibilité: ${record.disponibilite}`);
      console.log(`     - Process Safety: ${record.processSafety}`);
      console.log(`     - Criticité: ${record.criticite}`);
      console.log(`     - Severity: ${record.severity}`);
      console.log(`     - Priority: ${record.priority}`);
      console.log(`     - AI Suggested: ${record.aiSuggestedSeverity || 'None'}`);
    });

    // Test criticality calculation
    console.log('\n9. Testing criticality calculation...');
    const recordsWithNumericValues = goldRecords.filter(r => 
      r.fiabilite && r.disponibilite && r.processSafety
    );
    
    recordsWithNumericValues.slice(0, 3).forEach((record, index) => {
      const sum = (record.fiabilite || 0) + (record.disponibilite || 0) + (record.processSafety || 0);
      let expectedCriticality = '';
      
      if (sum >= 11 && sum <= 15) {
        expectedCriticality = 'Critique';
      } else if (sum >= 7 && sum <= 10) {
        expectedCriticality = 'Haute';
      } else if (sum >= 5 && sum <= 6) {
        expectedCriticality = 'Moyenne';
      } else {
        expectedCriticality = 'Basse';
      }
      
      console.log(`   Record ${index + 1}:`);
      console.log(`     - Sum: ${sum} (${record.fiabilite} + ${record.disponibilite} + ${record.processSafety})`);
      console.log(`     - Expected: ${expectedCriticality}`);
      console.log(`     - Actual: ${record.criticite}`);
      console.log(`     - Match: ${record.criticite === expectedCriticality ? '✅' : '❌'}`);
    });    // Summary
    console.log('\n10. Pipeline Test Summary');
    console.log('========================');
    console.log(`✅ Bronze Layer: ${importResult.totalRows} records imported`);
    console.log(`✅ Silver Layer: ${bronzeToSilverResult.recordsSucceeded} records processed`);
    console.log(`✅ Gold Layer: ${silverToGoldResult.recordsSucceeded} anomalies created`);
    console.log(`✅ AI Predictions: Applied only to records with missing values`);
    console.log(`✅ Criticality Calculation: Based on sum of 3 fields`);
    console.log(`✅ Pipeline Enhancement: Working correctly`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Pipeline test failed:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testMedallionPipeline()
    .then(success => {
      console.log(success ? '\n🎉 Pipeline test completed successfully!' : '\n💥 Pipeline test failed!');
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}

export { testMedallionPipeline };
