import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = await fetch('https://taqa-efuvl.ondigitalocean.app/train/reload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || 'Failed to reload models',
          models_loaded: false
        },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Model reload API error:', error);
    return NextResponse.json(
      {
        error: 'Model reload failed',
        message: 'Failed to connect to AI model reload service',
        success: false
      },
      { status: 500 }
    );
  }
}
