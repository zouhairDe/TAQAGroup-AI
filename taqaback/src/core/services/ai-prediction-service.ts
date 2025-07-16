import axios from 'axios';
import { createLogger } from '../utils/logger';

const logger = createLogger('AIPredictionService');

/**
 * Interface for AI prediction request payload
 */
export interface AIPredictionRequest {
  anomaly_id: string;
  description: string;
  equipment_name: string;
  equipment_id: string;
}

/**
 * Interface for AI prediction response
 */
export interface AIPredictionResponse {
  batch_info: {
    average_time_per_anomaly: number;
    failed_predictions: number;
    processing_time_seconds: number;
    successful_predictions: number;
    total_anomalies: number;
  };
  results: Array<{
    anomaly_id: string;
    equipment_id: string;
    equipment_name: string;
    maintenance_recommendations: string[];
    overall_score: number;
    predictions: {
      availability: {
        description: string;
        score: number;
      };
      process_safety: {
        description: string;
        score: number;
      };
      reliability: {
        description: string;
        score: number;
      };
    };
    risk_assessment: {
      critical_factors: string[];
      overall_risk_level: string;
      recommended_action: string;
      weakest_aspect: string;
    };
    status: string;
  }>;
  status: string;
}

/**
 * Service to handle AI predictions for anomalies
 */
export class AIPredictionService {
  private readonly apiUrl: string;

  constructor(customApiUrl?: string) {
    // Allow override of API URL via environment variable or constructor parameter
    this.apiUrl = customApiUrl || 
      process.env.AI_PREDICTION_API_URL || 
      'https://taqa-efuvl.ondigitalocean.app/predict';
  }

  /**
   * Get AI predictions for a batch of anomalies
   * @param anomalies Array of anomalies to get predictions for
   * @returns AI prediction response
   */
  async getPredictions(anomalies: AIPredictionRequest[]): Promise<AIPredictionResponse> {
    try {
      logger.info(`Requesting AI predictions for ${anomalies.length} anomalies`);
      logger.info(`AI API URL: ${this.apiUrl}`);
      logger.info(`Request payload:`, JSON.stringify(anomalies, null, 2));
      
      const response = await axios.post<AIPredictionResponse>(
        this.apiUrl,
        anomalies,
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000 // 30 second timeout
        }
      );

      logger.info(`AI predictions received: ${response.data.results.length} results`);
      logger.info(`AI response:`, JSON.stringify(response.data, null, 2));
      
      return response.data;    } catch (error) {
      let errorMessage = 'Unknown error';
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          errorMessage = `Could not connect to AI service at ${this.apiUrl}. The service may be down.`;
        } else if (error.response) {
          errorMessage = `Server responded with status ${error.response.status}: ${error.response.statusText}`;
          logger.error(`AI API response data:`, error.response.data);
        } else if (error.request) {
          errorMessage = 'No response received from server';
          logger.error(`AI API request config:`, error.request);
        } else {
          errorMessage = error.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      logger.error(`Error getting AI predictions: ${errorMessage}`);
      logger.error(`Full error object:`, error);
      console.error(`AI prediction API error: ${errorMessage}`);
      
      // Return a default response structure when the API call fails
      return {
        batch_info: {
          average_time_per_anomaly: 0,
          failed_predictions: anomalies.length,
          processing_time_seconds: 0,
          successful_predictions: 0,
          total_anomalies: anomalies.length
        },
        results: [],
        status: 'failed'
      };
    }
  }
  /**
   * Map AI prediction results to anomaly fields
   * @param prediction Single AI prediction result
   * @returns Mapped fields for anomaly update
   */
  mapPredictionToAnomalyFields(prediction: AIPredictionResponse['results'][0]): {
    disponibilite: number;
    fiabilite: number; 
    processSafety: number;
    criticite: string;
    severity: string;
    priority: string;
    durationToResolve: number;
    aiSuggestedSeverity?: string;
    aiFactors?: string[];
    aiConfidence?: number;
  } {
    // Extract and round the values
    const disponibilite = Math.round(prediction.predictions.availability.score);
    const fiabilite = Math.round(prediction.predictions.reliability.score);
    const processSafety = Math.round(prediction.predictions.process_safety.score);
    
    // Calculate criticite based on the sum of the three values
    const sum = disponibilite + fiabilite + processSafety;
    let criticite: string;
    let severity: string;
    let priority: string;
    
    // New criticality mapping based on user requirements:
    // > 9: Critical (P1), 7-8: Medium (P2), 3-6: Low (P3)
    if (sum > 9) {
      criticite = 'Critique';
      severity = 'critical';
      priority = 'P1';
    } else if (sum >= 7 && sum <= 8) {
      criticite = 'Moyenne';
      severity = 'medium';
      priority = 'P2';
    } else {
      criticite = 'Basse';
      severity = 'low';
      priority = 'P3';
    }

    // Generate random durationToResolve between 1 and 1000 hours
    const durationToResolve = Math.floor(Math.random() * 1000) + 1;

    logger.info(`Calculated criticality for prediction: sum=${sum}, criticite=${criticite}, severity=${severity}, priority=${priority}, durationToResolve=${durationToResolve}h ` +
      `(disponibilite=${disponibilite}, fiabilite=${fiabilite}, processSafety=${processSafety})`);

    return {
      disponibilite,
      fiabilite,
      processSafety,
      criticite,
      severity,
      priority,
      durationToResolve,
      aiSuggestedSeverity: prediction.risk_assessment.overall_risk_level,
      aiFactors: prediction.risk_assessment.critical_factors,
      aiConfidence: prediction.overall_score
    };
  }
}
