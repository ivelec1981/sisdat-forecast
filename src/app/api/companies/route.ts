import { NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/db';

export async function GET() {
  try {
    const companies = await DatabaseService.getCompanies();

    return NextResponse.json({
      success: true,
      data: companies
    });

  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}