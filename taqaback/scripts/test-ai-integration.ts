/**
 * Test script for AI prediction integration in the data processing pipeline
 * 
 * This script tests the complete integration of the AI prediction service
 * with the medallion data processing pipeline. It creates test anomalies,
 * runs the pipeline, and verifies that AI predictions are applied properly.
 * 
 * Run with: npx ts-node scripts/test-ai-integration.ts
 */

import { MedallionDataProcessor } from '../src/core/services/medallion-data-processor';
import { AIPredictionService } from '../src/core/services/ai-prediction-service';
import { PrismaClient } from '@prisma/client';
import { cleanAnomalyPipeline } from './clean-anomaly-pipeline';
import { createLogger } from '../src/core/utils/logger';

const logger = createLogger('AI-Integration-Test');

// Create test records in bronze layer, then run the pipeline to test AI integration
async function testAIIntegration() {
  const prisma = new PrismaClient();
  
  console.log('🧪 Testing AI Integration in Data Pipeline');
  console.log('----------------------------------------');
  try {    
    // Check for admin user and create one if needed
    console.log('Checking for admin user...');
    const adminUser = await prisma.user.findFirst({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.log('No admin user found, creating one...');
      await prisma.user.create({
        data: {
          email: 'admin@taqa.com',
          name: 'Test Admin',
          password: '$2b$10$gG9YDCho3Z.UYX3CK3IuweQwapyKL1VQJuzNBm6HBGVIpjLfNKs86', // hash of "admin123"
          role: 'admin',
          isActive: true
        }
      });
      console.log('Admin user created successfully');
    } else {
      console.log('Admin user found');
    }

    // 0. Clean existing data from the pipeline
    console.log('Cleaning anomaly pipeline data...');
    try {
      await cleanAnomalyPipeline();
    } catch (cleanupError) {
      console.warn('Warning: Pipeline cleanup failed - continuing with test:',
        cleanupError instanceof Error ? cleanupError.message : 'Unknown error');
      console.log('This is likely due to database permission restrictions.');
    }
    
    // 1. Create test anomalies in bronze layer
    console.log('\nCreating test anomalies in bronze layer...');
    
    const testAnomalies = [
      {
        numEquipement: 'TEST-EQUIP-001',
        description: 'Fuite importante d\'huile au niveau du palier avec vibrations anormales',
        dateDetectionAnomalie: new Date().toISOString(),
        descriptionEquipement: 'POMPE FUEL PRINCIPALE N°1',
        sectionProprietaire: 'TEST-SECTION',
        criticite: 'Haute',
        sourceFile: 'test-ai-integration.csv',
        rawData: {},
        isProcessed: false
      },
      {
        numEquipement: 'TEST-EQUIP-002',
        description: 'Température anormalement élevée sur le moteur électrique principal',
        dateDetectionAnomalie: new Date().toISOString(),
        descriptionEquipement: 'MOTEUR ÉLECTRIQUE GROUPE 3',
        sectionProprietaire: 'TEST-SECTION-2',
        criticite: 'Moyenne',
        sourceFile: 'test-ai-integration.csv',
        rawData: {},
        isProcessed: false
      },
      {
        numEquipement: 'TEST-EQUIP-003',
        description: 'Corrosion avancée sur la vanne d\'admission principale',
        dateDetectionAnomalie: new Date().toISOString(),
        descriptionEquipement: 'VANNE D\'ADMISSION CIRCUIT PRINCIPAL',
        sectionProprietaire: 'TEST-SECTION-3',
        criticite: 'Basse',
        sourceFile: 'test-ai-integration.csv',
        rawData: {},
        isProcessed: false
      }
    ];
    
    // Create all test anomalies
    for (const anomalyData of testAnomalies) {
      await prisma.bronzeAnomaliesRaw.create({ data: anomalyData });
    }
    
    console.log(`Created ${testAnomalies.length} test anomalies in bronze layer`);
    
    // 2. Test AI prediction service directly
    console.log('\nTesting AI prediction service directly...');
    const aiService = new AIPredictionService();
    const testPrediction = await aiService.getPredictions([{
      anomaly_id: 'TEST-EQUIP-001',
      description: testAnomalies[0].description,
      equipment_name: testAnomalies[0].descriptionEquipement,
      equipment_id: testAnomalies[0].numEquipement
    }]);
    
    console.log(`AI prediction status: ${testPrediction.status}`);
    console.log(`AI results received: ${testPrediction.results.length}`);
    
    if (testPrediction.results.length > 0) {
      const result = testPrediction.results[0];
      console.log('Sample prediction:');
      console.log(`- Availability: ${result.predictions.availability.score}`);
      console.log(`- Reliability: ${result.predictions.reliability.score}`);
      console.log(`- Process Safety: ${result.predictions.process_safety.score}`);
      console.log(`- Risk Level: ${result.risk_assessment.overall_risk_level}`);
    }
    
    // 3. Run the complete pipeline
    console.log('\nRunning complete data processing pipeline...');
    const processor = new MedallionDataProcessor();
    const pipelineResult = await processor.runCompletePipeline();
    
    console.log('\nPipeline results:');
    console.log(`- Bronze to Silver: ${pipelineResult.bronzeToSilver.recordsSucceeded} succeeded, ${pipelineResult.bronzeToSilver.recordsFailed} failed`);
    console.log(`- Silver to Gold: ${pipelineResult.silverToGold.recordsSucceeded} succeeded, ${pipelineResult.silverToGold.recordsFailed} failed`);
    
    // 4. Verify results in Anomaly table
    console.log('\nVerifying final Anomaly records:');
    
    for (const testAnomaly of testAnomalies) {
      const finalAnomaly = await prisma.anomaly.findFirst({
        where: { equipmentIdentifier: testAnomaly.numEquipement },
        orderBy: { createdAt: 'desc' }
      });
      
      if (finalAnomaly) {
        console.log(`\nAnomaly for ${testAnomaly.descriptionEquipement}:`);
        console.log(`- Code: ${finalAnomaly.code}`);
        console.log(`- Status: ${finalAnomaly.status}`);
        console.log(`- Severity: ${finalAnomaly.severity}`);
        console.log(`- Priority: ${finalAnomaly.priority}`);
        console.log(`- Disponibilité: ${finalAnomaly.disponibilite}`);
        console.log(`- Fiabilité: ${finalAnomaly.fiabilite}`);
        console.log(`- Process Safety: ${finalAnomaly.processSafety}`);
        console.log(`- Criticité: ${finalAnomaly.criticite}`);
        console.log(`- AI Confidence: ${finalAnomaly.aiConfidence || 'Not set'}`);
        console.log(`- AI Suggested Severity: ${finalAnomaly.aiSuggestedSeverity || 'Not set'}`);
        console.log(`- AI Factors: ${finalAnomaly.aiFactors?.join(', ') || 'Not set'}`);
      } else {
        console.log(`❌ No final anomaly found for ${testAnomaly.numEquipement}`);
      }
    }
    
    console.log('\n✅ AI integration test completed');
    
  } catch (error) {
    console.error('❌ Error during AI integration test:', error instanceof Error ? error.message : 'Unknown error');
    logger.error('AI integration test failed', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test if executed directly
if (require.main === module) {
  testAIIntegration()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
