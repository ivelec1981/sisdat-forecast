import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('companyId');
    const category = searchParams.get('category');
    const year = searchParams.get('year');
    const model = searchParams.get('model');

    const filters: any = {};
    
    if (companyId) filters.companyId = parseInt(companyId);
    if (category) filters.category = category;
    if (year) filters.year = parseInt(year);
    if (model) filters.model = model;

    const data = await DatabaseService.getEnergyData(filters);

    return NextResponse.json({
      success: true,
      data,
      count: data.length
    });

  } catch (error) {
    console.error('Error fetching energy data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch energy data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar datos requeridos
    const { companyId, category, year, model, energy } = body;
    
    if (!companyId || !category || !year || !model || energy === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newRecord = await DatabaseService.createEnergyRecord({
      companyId: parseInt(companyId),
      category,
      year: parseInt(year),
      month: body.month ? parseInt(body.month) : undefined,
      model,
      energy: parseFloat(energy),
      accuracy: body.accuracy ? parseFloat(body.accuracy) : undefined
    });

    // Log the creation
    await DatabaseService.logSystemEvent(
      'info',
      `New energy record created for company ${companyId}`,
      'api',
      { recordId: newRecord.id, category, year, model }
    );

    return NextResponse.json({
      success: true,
      data: newRecord
    });

  } catch (error) {
    console.error('Error creating energy record:', error);
    
    // Log the error
    await DatabaseService.logSystemEvent(
      'error',
      'Failed to create energy record',
      'api',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );

    return NextResponse.json(
      { success: false, error: 'Failed to create energy record' },
      { status: 500 }
    );
  }
}