import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import * as path from 'path';

const prisma = new PrismaClient();

interface ExcelRow {
  'id_comp': number;
  'power_company': string;
  'date': number;
  'type': string;
  'ener_comb': number | null;
  'ener_prophet': number | null;
  'ener_gru': number | null;
  'ener_wavenet': number | null;
  'ener_gbr': number | null;
  'pot_comb': number | null;
  'pot_prophet': number | null;
  'pot_gbr': number | null;
  'pot_gru': number | null;
  'pot_wavenet': number | null;
}

function parseExcelDate(excelDate: number): Date {
  // Excel date as serial number (days since 1900-01-01)
  // But Excel incorrectly treats 1900 as a leap year, so we need to adjust
  const date = new Date((excelDate - 25569) * 86400 * 1000);
  return date;
}

function validateAndCleanNumericValue(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  if (typeof value === 'string') {
    // Remove any non-numeric characters except decimal point and minus sign
    const cleaned = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  
  if (typeof value === 'number') {
    return isNaN(value) ? null : value;
  }
  
  return null;
}

async function migratePublicLightingData() {
  try {
    console.log('🚀 Iniciando migración de datos de alumbrado público...');
    
    // Read Excel file
    const filePath = path.join(__dirname, '..', 'data', 'ap_GLR.xlsx');
    console.log('📁 Leyendo archivo:', filePath);
    
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON using first row as headers
    const rawData: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet, { 
      defval: null 
    }) as any;
    
    console.log(`📊 Total filas a procesar: ${rawData.length}`);
    console.log('📋 Headers encontrados:', Object.keys(rawData[0] || {}));
    
    // Transform and validate data
    const publicLightingRecords = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < rawData.length; i++) {
      const row = rawData[i] as ExcelRow;
      
      try {
        // Skip empty rows
        if (!row || !row.power_company || !row.date) {
          console.warn(`⚠️  Fila ${i + 1}: Faltan campos requeridos (power_company o date)`);
          errorCount++;
          continue;
        }
        
        // Parse and validate date
        const date = parseExcelDate(row.date);
        if (isNaN(date.getTime())) {
          console.warn(`⚠️  Fila ${i + 1}: Fecha inválida: ${row.date}`);
          errorCount++;
          continue;
        }
        
        // Clean and validate numeric values
        const record = {
          powerCompany: row.power_company.toString().trim(),
          date: date,
          type: (row.type || 'public_lighting').toString().trim(),
          enerComb: validateAndCleanNumericValue(row.ener_comb),
          enerProphet: validateAndCleanNumericValue(row.ener_prophet),
          enerGru: validateAndCleanNumericValue(row.ener_gru),
          enerWavenet: validateAndCleanNumericValue(row.ener_wavenet),
          enerGbr: validateAndCleanNumericValue(row.ener_gbr),
          potComb: validateAndCleanNumericValue(row.pot_comb),
          potProphet: validateAndCleanNumericValue(row.pot_prophet),
          potGbr: validateAndCleanNumericValue(row.pot_gbr),
          potGru: validateAndCleanNumericValue(row.pot_gru),
          potWavenet: validateAndCleanNumericValue(row.pot_wavenet)
        };
        
        publicLightingRecords.push(record);
        successCount++;
        
        // Log progress every 50 records
        if (successCount % 50 === 0) {
          console.log(`✅ Procesadas ${successCount} filas...`);
        }
        
      } catch (error) {
        console.error(`❌ Error procesando fila ${i + 1}:`, error);
        errorCount++;
      }
    }
    
    console.log(`📈 Resumen del procesamiento:`);
    console.log(`   ✅ Registros válidos: ${successCount}`);
    console.log(`   ❌ Registros con errores: ${errorCount}`);
    console.log(`   📊 Total procesado: ${successCount + errorCount}`);
    
    if (publicLightingRecords.length === 0) {
      console.log('⚠️  No hay registros válidos para migrar');
      return;
    }
    
    // Insert into database
    console.log('💾 Insertando datos en la base de datos...');
    
    // Clear existing data for clean migration
    await prisma.publicLightingData.deleteMany();
    console.log('🗑️  Datos existentes de alumbrado público eliminados');
    
    // Insert in batches to avoid memory issues
    const batchSize = 100;
    let insertedCount = 0;
    
    for (let i = 0; i < publicLightingRecords.length; i += batchSize) {
      const batch = publicLightingRecords.slice(i, i + batchSize);
      
      try {
        await prisma.publicLightingData.createMany({
          data: batch,
          skipDuplicates: false
        });
        
        insertedCount += batch.length;
        console.log(`💾 Insertados ${insertedCount}/${publicLightingRecords.length} registros...`);
        
      } catch (error) {
        console.error('❌ Error insertando lote:', error);
        
        // Try inserting records individually to identify specific issues
        for (const record of batch) {
          try {
            await prisma.publicLightingData.create({ data: record });
            insertedCount++;
          } catch (individualError) {
            console.error('❌ Error insertando registro individual:', {
              company: record.powerCompany,
              date: record.date,
              error: individualError
            });
          }
        }
      }
    }
    
    // Verify insertion
    const totalRecords = await prisma.publicLightingData.count();
    console.log(`✅ Migración completada: ${totalRecords} registros en la base de datos`);
    
    // Show sample of inserted data
    const sampleRecords = await prisma.publicLightingData.findMany({
      take: 3,
      orderBy: { date: 'asc' }
    });
    
    console.log('📄 Muestra de datos insertados:');
    sampleRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.powerCompany} - ${record.date.toISOString().split('T')[0]} - Energía: ${record.enerProphet || 'N/A'} MWh`);
    });
    
    // Generate summary statistics
    const stats = await prisma.publicLightingData.aggregate({
      _avg: {
        enerProphet: true,
        potProphet: true
      },
      _count: {
        _all: true
      }
    });
    
    console.log('📊 Estadísticas de datos de alumbrado público:');
    console.log(`   📈 Promedio energía Prophet: ${stats._avg.enerProphet?.toFixed(2) || 'N/A'} MWh`);
    console.log(`   ⚡ Promedio potencia Prophet: ${stats._avg.potProphet?.toFixed(2) || 'N/A'} MW`);
    console.log(`   📋 Total registros: ${stats._count._all}`);
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute migration
if (require.main === module) {
  migratePublicLightingData()
    .then(() => {
      console.log('🎉 Migración de datos de alumbrado público completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la migración:', error);
      process.exit(1);
    });
}

export default migratePublicLightingData;