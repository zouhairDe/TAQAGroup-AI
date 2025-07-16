/**
 * Mock AI Prediction API Server
 * 
 * This script creates a local API that mimics the AI prediction service
 * for testing purposes when the actual external API is unavailable.
 * 
 * Run with: npx ts-node scripts/mock-ai-prediction-api.ts
 * Then set environment variable: AI_PREDICTION_API_URL=http://localhost:3333/predict
 */

import express from 'express';
import { AIPredictionRequest } from '../src/core/services/ai-prediction-service';

const app = express();
const port = 3333;

app.use(express.json());

// Mock prediction endpoint
app.post('/predict', (req: express.Request, res: express.Response) => {
  const anomalies = req.body as AIPredictionRequest[];
  
  console.log(`Received request for ${anomalies.length} anomalies`);
  
  // Create mock predictions
  const results = anomalies.map(anomaly => {
    // Generate semi-random scores based on the description
    const availabilityScore = 1 + Math.floor(Math.random() * 2);
    const reliabilityScore = 1 + Math.floor(Math.random() * 2);
    const processSafetyScore = 1 + Math.floor(Math.random() * 3);
    
    return {
      anomaly_id: anomaly.anomaly_id,
      equipment_id: anomaly.equipment_id,
      equipment_name: anomaly.equipment_name,
      maintenance_recommendations: [
        "🚨 CRITICAL: Immediate safety assessment required",
        "🛑 STOP operations until safety issues are resolved",
        "🔧 URGENT: Equipment likely to fail soon - schedule immediate maintenance"
      ],
      overall_score: 1.47,
      predictions: {
        availability: {
          description: "Equipment uptime and operational readiness",
          score: availabilityScore
        },
        process_safety: {
          description: "Safety risk assessment and hazard identification",
          score: processSafetyScore
        },
        reliability: {
          description: "Equipment integrity and dependability",
          score: reliabilityScore
        }
      },
      risk_assessment: {
        critical_factors: [
          "Low Availability",
          "Low Reliability",
          "Safety Risk"
        ],
        overall_risk_level: "CRITICAL",
        recommended_action: "Immediate action required",
        weakest_aspect: "availability"
      },
      status: "success"
    };
  });
  
  // Create response object
  const response = {
    batch_info: {
      average_time_per_anomaly: 0.02,
      failed_predictions: 0,
      processing_time_seconds: 0.04,
      successful_predictions: results.length,
      total_anomalies: anomalies.length
    },
    results,
    status: "completed"
  };
  
  // Simulate a slight delay like a real API would have
  setTimeout(() => {
    res.json(response);
  }, 500);
});

// Start server
const server = app.listen(port, () => {
  console.log(`Mock AI prediction API running at http://localhost:${port}`);
  console.log('Use endpoint: http://localhost:3333/predict for testing');
  console.log('To use this mock API with the test scripts:');
  console.log('Set environment variable AI_PREDICTION_API_URL=http://localhost:3333/predict');
  console.log('\nPress Ctrl+C to stop the server');
});

// Add proper error handling for the server
server.on('error', (err: Error) => {
  console.error('Error starting mock AI prediction API:', err);
  process.exit(1);
});
