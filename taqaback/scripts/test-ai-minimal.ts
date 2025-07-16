/**
 * Minimal Test Script for AI Prediction Service
 * 
 * This script provides a minimal test for the AI prediction service
 * without any dependencies that might cause TypeScript errors.
 * 
 * Run with: npx ts-node scripts/test-ai-minimal.ts
 */

import axios from 'axios';

// Test data
const testAnomalies = [
  {
    anomaly_id: 'ANO-2024-001',
    description: 'Fuite importante d\'huile au niveau du palier avec vibrations anormales',
    equipment_name: 'POMPE FUEL PRINCIPALE N°1',
    equipment_id: '98b82203-7170-45bf-879e-f47ba6e12c86'
  }
];

// API URL
const apiUrl = process.env.AI_PREDICTION_API_URL || 'https://taqa-efuvl.ondigitalocean.app/predict';

async function runTest() {
  console.log('🧪 Simple AI Prediction Test');
  console.log('---------------------------');
  console.log(`API URL: ${apiUrl}`);
  console.log('Sending test request...\n');

  try {
    const startTime = Date.now();
    const response = await axios.post(apiUrl, testAnomalies, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000 // 10 second timeout
    });
    const endTime = Date.now();

    console.log(`✅ API responded in ${endTime - startTime}ms`);
    console.log(`Status: ${response.data.status}`);
    
    if (response.data.results && response.data.results.length > 0) {
      const result = response.data.results[0];
      console.log('\nSample prediction:');
      console.log(`- Availability: ${result.predictions.availability.score}`);
      console.log(`- Reliability: ${result.predictions.reliability.score}`);
      console.log(`- Process Safety: ${result.predictions.process_safety.score}`);
      console.log(`- Risk Level: ${result.risk_assessment.overall_risk_level}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error contacting AI prediction API:');
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.error(`Could not connect to ${apiUrl} - the service may be down`);
      } else if (error.response) {
        console.error(`Server responded with status ${error.response.status}: ${error.response.statusText}`);
      } else if (error.request) {
        console.error('No response received from server');
      } else {
        console.error(error.message);
      }
    } else if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error('Unknown error occurred');
    }
    
    console.log('\n🔄 You can try using the mock API instead:');
    console.log('1. Start mock API: npx ts-node scripts/mock-ai-prediction-api.ts');
    console.log('2. In a new terminal: $env:AI_PREDICTION_API_URL = "http://localhost:3333/predict"');
    console.log('3. Run this test again');
    console.log('\nOr use the combined script: npx ts-node scripts/test-with-mock-api.ts');
    
    return false;
  }
}

// Run if executed directly
if (require.main === module) {
  runTest()
    .then(success => process.exit(success ? 0 : 1))
    .catch(() => process.exit(1));
}
