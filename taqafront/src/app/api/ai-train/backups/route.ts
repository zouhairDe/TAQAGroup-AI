import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://taqa-efuvl.ondigitalocean.app/train/backups');
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to list backups',
          message: `API Error: ${response.status} ${response.statusText}`
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Backups API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to list backups',
        message: 'Failed to connect to AI backup service'
      },
      { status: 500 }
    );
  }
}
