const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Por ahora, vamos a crear datos de ejemplo basados en la estructura
// Una vez que tengamos acceso al Excel, podemos reemplazar esto con la lectura real
async function importSampleData() {
  try {
    console.log('Iniciando importación de datos residenciales...');

    // Datos de ejemplo que siguen la estructura del Excel
    const sampleData = [
      {
        powerCompany: 'E.E. Quito',
        date: new Date('2023-01-01'),
        type: 'residential',
        enerComb: 1250.5,
        enerProphet: 1245.2,
        enerGru: 1260.8,
        enerWavenet: 1248.1,
        enerGbr: 1255.3,
        potComb: 180.2,
        potProphet: 178.5,
        potGbr: 182.1,
        potGru: 179.8,
        potWavenet: 181.0
      },
      {
        powerCompany: 'CNEL Guayas-Los Ríos',
        date: new Date('2023-01-01'),
        type: 'residential',
        enerComb: 980.3,
        enerProphet: 975.1,
        enerGru: 985.7,
        enerWavenet: 978.4,
        enerGbr: 982.9,
        potComb: 145.8,
        potProphet: 143.2,
        potGbr: 147.5,
        potGru: 144.9,
        potWavenet: 146.1
      },
      {
        powerCompany: 'CENTROSUR',
        date: new Date('2023-01-01'),
        type: 'residential',
        enerComb: 420.7,
        enerProphet: 418.3,
        enerGru: 423.1,
        enerWavenet: 419.8,
        enerGbr: 421.5,
        potComb: 65.4,
        potProphet: 64.1,
        potGbr: 66.2,
        potGru: 64.8,
        potWavenet: 65.7
      }
    ];

    // Insertar datos de ejemplo
    for (const data of sampleData) {
      await prisma.residentialData.upsert({
        where: {
          powerCompany_date_type: {
            powerCompany: data.powerCompany,
            date: data.date,
            type: data.type
          }
        },
        update: data,
        create: data
      });
    }

    console.log(`✅ Importación completada. ${sampleData.length} registros procesados.`);
    
    // Verificar datos importados
    const count = await prisma.residentialData.count();
    console.log(`📊 Total de registros en la base de datos: ${count}`);

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para leer datos reales del Excel (requiere librerías adicionales)
async function importFromExcel(filePath) {
  console.log('⚠️  Para importar desde Excel, necesitamos instalar xlsx o similar');
  console.log('Por ahora, usando datos de ejemplo...');
  return importSampleData();
}

// Ejecutar importación
if (require.main === module) {
  const excelPath = '/mnt/c/Documentos/DTEII/Ecuacier/Residencial_GLR.xlsx';
  importFromExcel(excelPath);
}

module.exports = { importSampleData, importFromExcel };