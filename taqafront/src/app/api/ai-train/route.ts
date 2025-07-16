import { NextRequest, NextResponse } from 'next/server';

// Training data interface
interface TrainingRecord {
  anomaly_id: string;
  description: string;
  equipment_name: string;
  equipment_id: string;
  availability_score: number;
  fiability_score: number;
  process_safety_score: number;
}

// Validation function
function validateTrainingData(records: TrainingRecord[]): string[] {
  const errors: string[] = [];
  
  if (!Array.isArray(records) || records.length === 0) {
    errors.push('Training data must be a non-empty array');
    return errors;
  }
  
  if (records.length > 1000) {
    errors.push('Maximum 1000 records per training session');
  }
  
  records.forEach((record, index) => {
    const recordNum = index + 1;
    
    // Required fields
    if (!record.anomaly_id) {
      errors.push(`Record ${recordNum}: Missing required field 'anomaly_id'`);
    }
    if (!record.description) {
      errors.push(`Record ${recordNum}: Missing required field 'description'`);
    }
    if (!record.equipment_name) {
      errors.push(`Record ${recordNum}: Missing required field 'equipment_name'`);
    }
    if (!record.equipment_id) {
      errors.push(`Record ${recordNum}: Missing required field 'equipment_id'`);
    }
    
    // Description length validation
    if (record.description && record.description.length > 2000) {
      errors.push(`Record ${recordNum}: Description too long (max 2000 characters)`);
    }
    
    // Score validations
    if (record.availability_score !== undefined && (record.availability_score < 1 || record.availability_score > 5)) {
      errors.push(`Record ${recordNum}: availability_score must be between 1 and 5, got ${record.availability_score}`);
    }
    if (record.fiability_score !== undefined && (record.fiability_score < 1 || record.fiability_score > 5)) {
      errors.push(`Record ${recordNum}: fiability_score must be between 1 and 5, got ${record.fiability_score}`);
    }
    if (record.process_safety_score !== undefined && (record.process_safety_score < 1 || record.process_safety_score > 5)) {
      errors.push(`Record ${recordNum}: process_safety_score must be between 1 and 5, got ${record.process_safety_score}`);
    }
  });
  
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the training data
    const validationErrors = validateTrainingData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Data validation failed',
          validation_errors: validationErrors,
          is_training: false
        },
        { status: 400 }
      );
    }
    
    // Send training request to the AI service
    const response = await fetch('https://taqa-efuvl.ondigitalocean.app/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 400) {
        return NextResponse.json(data, { status: 400 });
      }
      
      return NextResponse.json(
        {
          error: 'Training failed',
          message: data.message || `API Error: ${response.status} ${response.statusText}`,
          success: false
        },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Training API error:', error);
    return NextResponse.json(
      {
        error: 'Training failed',
        message: 'Failed to connect to AI training service',
        success: false
      },
      { status: 500 }
    );
  }
}
