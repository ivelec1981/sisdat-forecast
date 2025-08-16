import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import path from 'path';

const prisma = new PrismaClient();

// Función para convertir fecha serial de Excel a Date
function excelSerialToDate(serial: number): Date {
  // Excel cuenta los días desde 1900-01-01, pero tiene un bug que considera 1900 como año bisiesto
  // Por eso restamos 1 día adicional
  const excelEpoch = new Date(1900, 0, 1);
  const date = new Date(excelEpoch.getTime() + (serial - 2) * 24 * 60 * 60 * 1000);
  return date;
}

// Función para limpiar y convertir valores numéricos
function cleanNumericValue(value: any): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  
  const numValue = parseFloat(value);
  return isNaN(numValue) ? null : numValue;
}

async function migrateOthersData() {
  try {
    console.log('🚀 Iniciando migración de datos de otros sectores...');
    
    // Ruta al archivo Excel
    const excelPath = path.join(process.cwd(), 'data', 'otros_GLR.xlsx');
    console.log(`📁 Leyendo archivo: ${excelPath}`);
    
    // Leer el archivo Excel
    const workbook = XLSX.readFile(excelPath);
    console.log(`📊 Hojas disponibles: ${workbook.SheetNames.join(', ')}`);
    
    // Verificar si existe la hoja 'other' o usar la primera hoja disponible
    let sheetName = 'other';
    if (!workbook.SheetNames.includes(sheetName)) {
      sheetName = workbook.SheetNames[0];
      console.log(`⚠️ Hoja 'other' no encontrada, usando: ${sheetName}`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📈 Total de filas en Excel: ${data.length}`);
    
    if (data.length < 2) {
      throw new Error('El archivo Excel no contiene datos suficientes');
    }
    
    // Obtener headers (primera fila)
    const headers = data[0] as string[];
    console.log('📋 Headers encontrados:', headers);
    
    // Mapear índices de columnas (basado en análisis previo)
    const columnMap = {
      id_comp: 0,
      power_company: 1,
      date: 2,
      type: 3,
      ener_comb: 4,
      ener_prophet: 5,
      ener_gru: 6,
      ener_wavenet: 7,
      ener_gbr: 8,
      pot_comb: 9,
      pot_prophet: 10,
      pot_gbr: 11,
      pot_gru: 12,
      pot_wavenet: 13
    };
    
    // Procesar datos (saltando la fila de headers)
    const processedData = [];
    let errors = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      
      if (!row || row.length === 0) {
        continue;
      }
      
      try {
        // Convertir fecha serial a Date
        const dateSerial = row[columnMap.date];
        let date: Date;
        
        if (typeof dateSerial === 'number') {
          date = excelSerialToDate(dateSerial);
        } else {
          // Intentar parsear como string de fecha
          date = new Date(dateSerial);
          if (isNaN(date.getTime())) {
            throw new Error(`Fecha inválida: ${dateSerial}`);
          }
        }
        
        const record = {
          powerCompany: row[columnMap.power_company] || 'CNEL-Guayas Los Ríos',
          date: date,
          type: row[columnMap.type] || 'histórico',
          
          // Datos de energía
          enerComb: cleanNumericValue(row[columnMap.ener_comb]),
          enerProphet: cleanNumericValue(row[columnMap.ener_prophet]),
          enerGru: cleanNumericValue(row[columnMap.ener_gru]),
          enerWavenet: cleanNumericValue(row[columnMap.ener_wavenet]),
          enerGbr: cleanNumericValue(row[columnMap.ener_gbr]),
          
          // Datos de potencia
          potComb: cleanNumericValue(row[columnMap.pot_comb]),
          potProphet: cleanNumericValue(row[columnMap.pot_prophet]),
          potGbr: cleanNumericValue(row[columnMap.pot_gbr]),
          potGru: cleanNumericValue(row[columnMap.pot_gru]),
          potWavenet: cleanNumericValue(row[columnMap.pot_wavenet])
        };
        
        processedData.push(record);
        
        // Log de progreso cada 50 registros
        if (processedData.length % 50 === 0) {
          console.log(`✅ Procesados ${processedData.length} registros...`);
        }
        
      } catch (error) {
        console.error(`❌ Error procesando fila ${i}:`, error);
        errors++;
      }
    }
    
    console.log(`📊 Registros procesados: ${processedData.length}`);
    console.log(`❌ Errores encontrados: ${errors}`);
    
    if (processedData.length === 0) {
      throw new Error('No se pudieron procesar datos válidos');
    }
    
    // Limpiar datos de otros sectores existentes
    console.log('🧹 Limpiando datos de otros sectores existentes...');
    await prisma.othersData.deleteMany({});
    
    // Insertar nuevos datos en lotes
    console.log('💾 Insertando datos en la base de datos...');
    const batchSize = 50;
    
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      await prisma.othersData.createMany({
        data: batch
      });
      
      console.log(`💾 Insertados ${Math.min(i + batchSize, processedData.length)}/${processedData.length} registros...`);
    }
    
    // Verificar resultados
    const totalRecords = await prisma.othersData.count();
    console.log('✅ Migración completada!');
    console.log(`📊 Registros insertados: ${processedData.length}`);
    console.log(`📈 Total en base de datos: ${totalRecords}`);
    
    // Mostrar estadísticas por empresa
    const companies = await prisma.othersData.groupBy({
      by: ['powerCompany'],
      _count: {
        powerCompany: true
      }
    });
    
    console.log('\n📈 Estadísticas por empresa:');
    companies.forEach(company => {
      console.log(`  - ${company.powerCompany}: ${company._count.powerCompany} registros`);
    });
    
    console.log('🎉 Migración de datos de otros sectores completada exitosamente!');
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
if (require.main === module) {
  migrateOthersData()
    .then(() => {
      console.log('🏁 Script de migración terminado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migración falló:', error);
      process.exit(1);
    });
}

export { migrateOthersData };