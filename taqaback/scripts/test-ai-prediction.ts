/**
 * Test script for the AI Prediction service
 * 
 * This script tests the AI Prediction API without running the full pipeline.
 * It sends test anomaly data to the prediction service and displays the results.
 * 
 * Run with: npx ts-node scripts/test-ai-prediction.ts
 */

import { AIPredictionService, AIPredictionRequest } from '../src/core/services/ai-prediction-service';

async function testAIPrediction() {
  console.log('🧪 Testing AI Prediction Service');
  console.log('------------------------------');

  // Create test data
  const testAnomalies: AIPredictionRequest[] = [
    {
      anomaly_id: 'ANO-2024-001',
      description: 'Fuite importante d\'huile au niveau du palier avec vibrations anormales',
      equipment_name: 'POMPE FUEL PRINCIPALE N°1',
      equipment_id: '98b82203-7170-45bf-879e-f47ba6e12c86'
    },
    {
      anomaly_id: 'ANO-2024-002',
      description: 'Température anormalement élevée sur le moteur électrique principal',
      equipment_name: 'MOTEUR ÉLECTRIQUE GROUPE 3',
      equipment_id: 'test-equip-002'
    },
    {
      anomaly_id: 'ANO-2024-003',
      description: 'Corrosion avancée sur la vanne d\'admission principale',
      equipment_name: 'VANNE D\'ADMISSION CIRCUIT PRINCIPAL',
      equipment_id: 'test-equip-003'
    }
  ];
  try {
    // Create prediction service
    const predictionService = new AIPredictionService();
    
    // Log test data
    console.log(`Sending ${testAnomalies.length} anomalies to prediction API...`);
    for (const anomaly of testAnomalies) {
      console.log(`- Anomaly ${anomaly.anomaly_id}: "${anomaly.description.substring(0, 40)}..."`);
    }
    
    // Send prediction request
    console.log('\nSending request to AI prediction service...');
    console.log(`API URL: ${predictionService['apiUrl']}`);
    console.log('This may take a few seconds...');
    
    const startTime = Date.now();
    const prediction = await predictionService.getPredictions(testAnomalies);
    const endTime = Date.now();
    
    // Display results
    console.log(`\nResponse received in ${endTime - startTime}ms`);
    console.log(`Status: ${prediction.status}`);
    console.log(`Batch processing time: ${prediction.batch_info.processing_time_seconds}s`);
    console.log(`Success rate: ${prediction.batch_info.successful_predictions}/${prediction.batch_info.total_anomalies}`);
    
    // Show detailed results
    console.log('\nDetailed Results:');
    for (const result of prediction.results) {
      console.log(`\nAnomaly ID: ${result.anomaly_id}`);
      console.log(`Equipment: ${result.equipment_name}`);
      console.log(`Status: ${result.status}`);
      
      if (result.status === 'success') {
        console.log(`Overall Score: ${result.overall_score}`);
        console.log('Predictions:');
        console.log(`- Availability: ${result.predictions.availability.score}`);
        console.log(`- Reliability: ${result.predictions.reliability.score}`);
        console.log(`- Process Safety: ${result.predictions.process_safety.score}`);
        
        console.log('Risk Assessment:');
        console.log(`- Overall Risk Level: ${result.risk_assessment.overall_risk_level}`);
        console.log(`- Recommended Action: ${result.risk_assessment.recommended_action}`);
        console.log(`- Critical Factors: ${result.risk_assessment.critical_factors.join(', ')}`);
        console.log(`- Weakest Aspect: ${result.risk_assessment.weakest_aspect}`);
        
        // Map to anomaly fields
        const anomalyFields = predictionService.mapPredictionToAnomalyFields(result);
        console.log('\nMapped Anomaly Fields:');
        console.log(`- Disponibilité: ${anomalyFields.disponibilite}`);
        console.log(`- Fiabilité: ${anomalyFields.fiabilite}`);
        console.log(`- Process Safety: ${anomalyFields.processSafety}`);
        console.log(`- Criticité: ${anomalyFields.criticite}`);
      } else {
        console.log('❌ Prediction failed for this anomaly');
      }
    }
    
    console.log('\n✅ AI Prediction test completed');
    
  } catch (error) {
    console.error('❌ Error during AI prediction test:', error);
  }
}

// Run the test if executed directly
if (require.main === module) {
  testAIPrediction()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}