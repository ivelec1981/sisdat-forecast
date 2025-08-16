import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');

    const stations = await DatabaseService.getTransmissionStations(
      companyId ? parseInt(companyId) : undefined
    );

    return NextResponse.json({
      success: true,
      data: stations,
      count: stations.length
    });

  } catch (error) {
    console.error('Error fetching transmission stations:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transmission stations' },
      { status: 500 }
    );
  }
}