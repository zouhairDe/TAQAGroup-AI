import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://taqa-efuvl.ondigitalocean.app/health');
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `API Error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Health API error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to AI health service' },
      { status: 500 }
    );
  }
} 