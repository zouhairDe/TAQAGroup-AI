/**
 * Test script for the AI Prediction service with specific data
 *
 * This script tests the AI Prediction API using provided anomaly data.
 * The backend runs on port 3333, not 3000.
 *
 * Run with: npx ts-node scripts/test-ai-endpoint-with-data.ts
 */

import { AIPredictionService, AIPredictionRequest } from '../src/core/services/ai-prediction-service';

async function testAIEndpointWithData() {
  console.log('🧪 Testing AI Prediction Service with Specific Data');
  console.log('Backend runs on port 3333');
  console.log('------------------------------');

  // Create test data based on your CSV data
  const testAnomalies: AIPredictionRequest[] = [
    {
      anomaly_id: 'TEST-001',
      description: 'Remise en état calorifuge vanne pompe de circulation',
      equipment_name: 'Vanne refoulement pompe circulation chaudière',
      equipment_id: '60c3aaa1-ef3d-48de-a360-bee0b615ffab'
    },
    {
      anomaly_id: 'TEST-002', 
      description: 'Remise en état calorifuge des vannes',
      equipment_name: 'SERVOMOTEUR VANNE DE PURGE VAPEUR',
      equipment_id: '22592481-646b-4c6e-8bd0-fe73c3f7cf65'
    },
    {
      anomaly_id: 'TEST-003',
      description: 'débouchage trop plein  décrasseur .',
      equipment_name: 'DECRASSEUR',
      equipment_id: 'dcd4635e-ec4c-43ec-90f2-3ff21755c46a'
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
        console.log('AI Predictions:');
        console.log(`- Availability: ${result.predictions.availability.score}`);
        console.log(`- Reliability: ${result.predictions.reliability.score}`);
        console.log(`- Process Safety: ${result.predictions.process_safety.score}`);

        console.log('Risk Assessment:');
        console.log(`- Overall Risk Level: ${result.risk_assessment.overall_risk_level}`);
        console.log(`- Recommended Action: ${result.risk_assessment.recommended_action}`);
        console.log(`- Critical Factors: ${result.risk_assessment.critical_factors.join(', ')}`);
        console.log(`- Weakest Aspect: ${result.risk_assessment.weakest_aspect}`);

        // Map to anomaly fields with updated criticality calculation
        const anomalyFields = predictionService.mapPredictionToAnomalyFields(result);
        console.log('\nMapped Anomaly Fields (will be used in database):');
        console.log(`- Disponibilité: ${anomalyFields.disponibilite}`);
        console.log(`- Fiabilité Intégrité: ${anomalyFields.fiabilite}`);
        console.log(`- Process Safety: ${anomalyFields.processSafety}`);
        console.log(`- Criticité: ${anomalyFields.criticite} (sum: ${anomalyFields.disponibilite + anomalyFields.fiabilite + anomalyFields.processSafety})`);
        
        // Show the criticality mapping
        const sum = anomalyFields.disponibilite + anomalyFields.fiabilite + anomalyFields.processSafety;
        console.log(`\nCriticality Mapping:`);
        console.log(`- Sum: ${sum}`);
        if (sum >= 11 && sum <= 15) {
          console.log(`- Level: Critical (11-15)`);
        } else if (sum >= 8 && sum <= 10) {
          console.log(`- Level: High (8-10)`);
        } else if (sum >= 4 && sum <= 7) {
          console.log(`- Level: Medium (4-7)`);
        } else {
          console.log(`- Level: Low (0-3)`);
        }
      } else {
        console.log('❌ Prediction failed for this anomaly');
      }
    }

    console.log('\n✅ AI Prediction test completed');
    console.log('\nNext Steps:');
    console.log('1. Import your CSV data to Bronze layer');
    console.log('2. Process Bronze → Silver layer');
    console.log('3. Process Silver → Gold layer (this will use AI predictions automatically)');
    console.log('   - AI will predict the 3 fields: Fiabilité Intégrité, Disponibilité, Process Safety');
    console.log('   - Criticité will be calculated as sum: 11-15=Critical, 8-10=High, 4-7=Medium, 0-3=Low');

  } catch (error) {
    console.error('❌ Error during AI prediction test:', error);
  }
}

// Run the test if executed directly
if (require.main === module) {
  testAIEndpointWithData()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}
