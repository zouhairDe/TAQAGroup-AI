import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { backup_name: string } }
) {
  try {
    const { backup_name } = params;
    
    if (!backup_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Backup name is required'
        },
        { status: 400 }
      );
    }
    
    const response = await fetch(`https://taqa-efuvl.ondigitalocean.app/train/restore/${backup_name}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Backup restore API error:', error);
    return NextResponse.json(
      {
        error: 'Backup restore failed',
        message: 'Failed to connect to AI backup restore service',
        success: false
      },
      { status: 500 }
    );
  }
}
