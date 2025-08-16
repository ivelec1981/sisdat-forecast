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

async function migrateIndustrialData() {
  try {
    console.log('🚀 Iniciando migración de datos industriales...');
    
    // Ruta al archivo Excel
    const excelPath = path.join(process.cwd(), 'data', 'Industrial_GLR.xlsx');
    console.log(`📁 Leyendo archivo: ${excelPath}`);
    
    // Leer el archivo Excel
    const workbook = XLSX.readFile(excelPath);
    console.log(`📊 Hojas disponibles: ${workbook.SheetNames.join(', ')}`);
    
    // Verificar si existe la hoja 'Industrial' o usar la primera hoja disponible
    let sheetName = 'Industrial';
    if (!workbook.SheetNames.includes(sheetName)) {
      sheetName = workbook.SheetNames[0];
      console.log(`⚠️ Hoja 'Industrial' no encontrada, usando: ${sheetName}`);
    }
    
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📈 Total de filas en Excel: ${data.length}`);
    
    if (data.length < 2) {
      throw new Error('El archivo Excel no tiene suficientes datos');
    }
    
    // Obtener headers (primera fila)
    const headers = data[0] as string[];
    console.log('📋 Headers encontrados:', headers);
    
    // Procesar datos (saltando la primera fila de headers)
    const records = [];
    let processedCount = 0;
    let errorCount = 0;
    
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as any[];
      
      if (!row || row.length === 0) {
        continue; // Saltar filas vacías
      }
      
      try {
        // Mapear columnas según la estructura real del archivo:
        // 0: id_comp, 1: power_company, 2: date, 3: type, 
        // 4: ener_comb, 5: ener_prophet, 6: ener_gru, 7: ener_wavenet, 8: ener_gbr,
        // 9: pot_comb, 10: pot_prophet, 11: pot_gbr, 12: pot_gru, 13: pot_wavenet
        
        let dateValue: Date;
        let powerCompany: string;
        let type: string;
        
        // Fecha está en columna 2 (índice 2) como serial de Excel
        if (typeof row[2] === 'number') {
          dateValue = excelSerialToDate(row[2]);
        } else {
          dateValue = new Date(row[2]);
        }
        
        // Validar fecha
        if (isNaN(dateValue.getTime())) {
          console.warn(`⚠️ Fecha inválida en fila ${i + 1}:`, row[2]);
          errorCount++;
          continue;
        }
        
        // Empresa está en columna 1 (índice 1)
        powerCompany = row[1] || 'CNEL-Guayas Los Ríos';
        if (typeof powerCompany !== 'string') {
          powerCompany = 'CNEL-Guayas Los Ríos';
        }
        
        // Tipo está en columna 3 (índice 3)
        type = row[3] || 'industrial';
        if (typeof type !== 'string') {
          type = 'industrial';
        }
        
        // Extraer valores según los índices reales
        const record = {
          powerCompany: powerCompany.trim(),
          date: dateValue,
          type: type.trim(),
          
          // Energía por modelo (columnas 4-8)
          enerComb: cleanNumericValue(row[4]),
          enerProphet: cleanNumericValue(row[5]),
          enerGru: cleanNumericValue(row[6]),
          enerWavenet: cleanNumericValue(row[7]),
          enerGbr: cleanNumericValue(row[8]),
          
          // Potencia por modelo (columnas 9-13)
          potComb: cleanNumericValue(row[9]),
          potProphet: cleanNumericValue(row[10]),
          potGbr: cleanNumericValue(row[11]),
          potGru: cleanNumericValue(row[12]),
          potWavenet: cleanNumericValue(row[13]),
        };
        
        records.push(record);
        processedCount++;
        
        if (processedCount % 50 === 0) {
          console.log(`✅ Procesados ${processedCount} registros...`);
        }
        
      } catch (error) {
        console.error(`❌ Error procesando fila ${i + 1}:`, error);
        errorCount++;
      }
    }
    
    console.log(`📊 Registros procesados: ${processedCount}`);
    console.log(`❌ Errores encontrados: ${errorCount}`);
    
    if (records.length === 0) {
      throw new Error('No se pudieron procesar registros válidos');
    }
    
    // Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos industriales existentes...');
    await prisma.industrialData.deleteMany({});
    
    // Insertar datos en la base de datos usando upsert para evitar duplicados
    console.log('💾 Insertando datos en la base de datos...');
    let insertedCount = 0;
    
    for (const record of records) {
      try {
        await prisma.industrialData.upsert({
          where: {
            powerCompany_date_type: {
              powerCompany: record.powerCompany,
              date: record.date,
              type: record.type
            }
          },
          update: record,
          create: record
        });
        insertedCount++;
        
        if (insertedCount % 50 === 0) {
          console.log(`💾 Insertados ${insertedCount}/${records.length} registros...`);
        }
      } catch (error) {
        console.error(`❌ Error insertando registro:`, error);
        console.error('Registro problemático:', record);
      }
    }
    
    console.log(`✅ Migración completada!`);
    console.log(`📊 Registros insertados: ${insertedCount}`);
    console.log(`📈 Total en base de datos:`, await prisma.industrialData.count());
    
    // Mostrar estadísticas
    const stats = await prisma.industrialData.groupBy({
      by: ['powerCompany'],
      _count: { id: true }
    });
    
    console.log('\n📈 Estadísticas por empresa:');
    stats.forEach(stat => {
      console.log(`  - ${stat.powerCompany}: ${stat._count.id} registros`);
    });
    
  } catch (error) {
    console.error('💥 Error en la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  migrateIndustrialData()
    .then(() => {
      console.log('🎉 Migración de datos industriales completada exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal en la migración:', error);
      process.exit(1);
    });
}

export default migrateIndustrialData;