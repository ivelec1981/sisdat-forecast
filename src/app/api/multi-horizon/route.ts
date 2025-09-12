import { NextRequest, NextResponse } from 'next/server';
import { multiHorizonIntegrator } from '@/lib/forecasting/MultiHorizonIntegrator';
import { DataQuality } from '@/lib/forecasting/EnhancedModelRegistry';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar parámetros requeridos
    if (!body.company) {
      return NextResponse.json(
        { error: 'El parámetro "company" es requerido' },
        { status: 400 }
      );
    }

    if (!body.region) {
      return NextResponse.json(
        { error: 'El parámetro "region" es requerido' },
        { status: 400 }
      );
    }

    // Valores por defecto
    const defaultSectors = ['residential', 'commercial', 'industrial'];
    const currentYear = new Date().getFullYear();
    const defaultProjectionYears = [
      currentYear + 1, 
      currentYear + 2, 
      currentYear + 3, 
      currentYear + 5, 
      currentYear + 10
    ];

    const requestData = {
      company: body.company,
      region: body.region,
      sectors: body.sectors || defaultSectors,
      projectionYears: body.projectionYears || defaultProjectionYears,
      includeMonthlyData: body.includeMonthlyData ?? false,
      reconcileWithIPF: body.reconcileWithIPF ?? true,
      generateTLP: body.generateTLP ?? false,
      includeTechnicalLosses: body.includeTechnicalLosses ?? true,
      dataQuality: body.dataQuality || DataQuality.MEDIUM
    };

    console.log(`📡 API: Generando proyecciones multi-horizonte para ${requestData.company}`);
    
    const result = await multiHorizonIntegrator.generateMultiHorizonProjections(requestData);
    
    // Agregar metadatos de la API
    const response = {
      ...result,
      apiMetadata: {
        requestedAt: new Date().toISOString(),
        processingTime: result.metadata.processingTime,
        version: '1.0.0',
        request: requestData
      }
    };

    console.log(`✅ API: Proyecciones generadas exitosamente (${result.projections.length} proyecciones)`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ API Error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Error interno del servidor';
    
    return NextResponse.json(
      { 
        error: 'Error generando proyecciones multi-horizonte',
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const company = searchParams.get('company');
    
    if (!company) {
      return NextResponse.json(
        { error: 'El parámetro "company" es requerido' },
        { status: 400 }
      );
    }

    // Obtener historial de proyecciones
    const history = multiHorizonIntegrator.getProcessingHistory(company);
    
    return NextResponse.json({
      company,
      historyCount: history.length,
      history: history.map(h => ({
        timestamp: h.metadata.processingTime,
        projectionsCount: h.projections.length,
        averageConfidence: h.projections.reduce((sum, p) => sum + p.confidence, 0) / h.projections.length,
        reconciled: !!h.reconciliationSummary,
        convergenceReached: h.reconciliationSummary?.convergenceReached,
        technicalLossesIncluded: !!h.technicalLosses?.length,
        tlpGenerated: !!h.typicalLoadProfiles?.length
      }))
    });
    
  } catch (error) {
    console.error('❌ API Error getting history:', error);
    
    return NextResponse.json(
      { 
        error: 'Error obteniendo historial de proyecciones',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}