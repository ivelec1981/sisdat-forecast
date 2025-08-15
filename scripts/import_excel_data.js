const { PrismaClient } = require('@prisma/client');
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Función para convertir fecha de Excel a Date object
function parseExcelDate(excelDate) {
  if (typeof excelDate === 'number') {
    // Excel date serial number
    const utc_days = Math.floor(excelDate - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info;
  } else if (typeof excelDate === 'string') {
    // Try to parse string date
    return new Date(excelDate);
  }
  return null;
}

// Función para limpiar y convertir valores numéricos
function parseNumericValue(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

async function readExcelFile(filePath) {
  try {
    console.log('📖 Leyendo archivo Excel:', filePath);
    
    // Verificar que el archivo existe
    if (!fs.existsSync(filePath)) {
      throw new Error(`Archivo no encontrado: ${filePath}`);
    }

    // Leer el archivo Excel
    const workbook = XLSX.readFile(filePath);
    console.log('📊 Hojas disponibles:', workbook.SheetNames);

    // Buscar la hoja "Residential"
    const sheetName = workbook.SheetNames.find(name => 
      name.toLowerCase().includes('residential') || name.toLowerCase().includes('residencial')
    );

    if (!sheetName) {
      console.log('⚠️ No se encontró hoja "Residential". Hojas disponibles:', workbook.SheetNames);
      console.log('🔍 Intentando con la primera hoja:', workbook.SheetNames[0]);
      return readSheet(workbook, workbook.SheetNames[0]);
    }

    console.log('✅ Usando hoja:', sheetName);
    return readSheet(workbook, sheetName);

  } catch (error) {
    console.error('❌ Error leyendo archivo Excel:', error.message);
    throw error;
  }
}

function readSheet(workbook, sheetName) {
  const worksheet = workbook.Sheets[sheetName];
  
  // Convertir hoja a JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1,  // Usar índices numéricos como headers
    defval: null // Valor por defecto para celdas vacías
  });

  console.log(`📋 Primeras 5 filas de la hoja "${sheetName}":`);
  jsonData.slice(0, 5).forEach((row, index) => {
    console.log(`  Fila ${index}:`, row);
  });

  // Buscar la fila de headers
  let headerRow = -1;
  const expectedHeaders = ['id', 'power_company', 'date', 'type'];
  
  for (let i = 0; i < Math.min(10, jsonData.length); i++) {
    const row = jsonData[i];
    if (row && row.some(cell => 
      typeof cell === 'string' && 
      expectedHeaders.some(header => 
        cell.toLowerCase().includes(header.toLowerCase())
      )
    )) {
      headerRow = i;
      break;
    }
  }

  if (headerRow === -1) {
    console.log('⚠️ No se encontraron headers esperados. Usando fila 0 como headers.');
    headerRow = 0;
  }

  console.log(`📍 Headers encontrados en fila ${headerRow}:`, jsonData[headerRow]);

  // Convertir datos usando los headers encontrados
  const headers = jsonData[headerRow].map(h => h ? h.toString().toLowerCase().trim() : '');
  const dataRows = jsonData.slice(headerRow + 1).filter(row => 
    row && row.some(cell => cell !== null && cell !== undefined && cell !== '')
  );

  console.log(`📊 Total de filas de datos: ${dataRows.length}`);
  
  return {
    headers,
    data: dataRows,
    totalRows: dataRows.length
  };
}

async function importExcelData(filePath) {
  try {
    console.log('🚀 Iniciando importación de datos reales desde Excel...\n');

    // Leer archivo Excel
    const { headers, data, totalRows } = await readExcelFile(filePath);
    
    if (totalRows === 0) {
      console.log('⚠️ No se encontraron datos para importar.');
      return;
    }

    // Mapear columnas basado en headers
    const columnMap = {};
    headers.forEach((header, index) => {
      const cleanHeader = header.toLowerCase().replace(/[^a-z_]/g, '');
      columnMap[cleanHeader] = index;
    });

    console.log('🗺️ Mapeo de columnas:', columnMap);

    // Buscar columnas requeridas
    const requiredColumns = {
      powerCompany: columnMap['powercompany'] || columnMap['power_company'] || columnMap['empresa'] || -1,
      date: columnMap['date'] || columnMap['fecha'] || -1,
      type: columnMap['type'] || columnMap['tipo'] || -1,
      enerComb: columnMap['enercomb'] || columnMap['ener_comb'] || -1,
      enerProphet: columnMap['enerprophet'] || columnMap['ener_prophet'] || -1,
      enerGru: columnMap['energru'] || columnMap['ener_gru'] || -1,
      enerWavenet: columnMap['enerwavenet'] || columnMap['ener_wavenet'] || -1,
      enerGbr: columnMap['energbr'] || columnMap['ener_gbr'] || -1,
      potComb: columnMap['potcomb'] || columnMap['pot_comb'] || -1,
      potProphet: columnMap['potprophet'] || columnMap['pot_prophet'] || -1,
      potGbr: columnMap['potgbr'] || columnMap['pot_gbr'] || -1,
      potGru: columnMap['potgru'] || columnMap['pot_gru'] || -1,
      potWavenet: columnMap['potwavenet'] || columnMap['pot_wavenet'] || -1
    };

    console.log('🎯 Columnas identificadas:', requiredColumns);

    let importedCount = 0;
    let errorCount = 0;

    // Limpiar datos existentes (opcional)
    console.log('🧹 Limpiando datos existentes...');
    await prisma.residentialData.deleteMany({});

    // Procesar cada fila
    for (let i = 0; i < data.length; i++) { // Importar todas las filas
      const row = data[i];
      
      try {
        // Extraer datos de la fila
        const recordData = {
          powerCompany: row[requiredColumns.powerCompany] || 'Desconocido',
          date: parseExcelDate(row[requiredColumns.date]) || new Date(),
          type: row[requiredColumns.type] || 'residential',
          enerComb: parseNumericValue(row[requiredColumns.enerComb]),
          enerProphet: parseNumericValue(row[requiredColumns.enerProphet]),
          enerGru: parseNumericValue(row[requiredColumns.enerGru]),
          enerWavenet: parseNumericValue(row[requiredColumns.enerWavenet]),
          enerGbr: parseNumericValue(row[requiredColumns.enerGbr]),
          potComb: parseNumericValue(row[requiredColumns.potComb]),
          potProphet: parseNumericValue(row[requiredColumns.potProphet]),
          potGbr: parseNumericValue(row[requiredColumns.potGbr]),
          potGru: parseNumericValue(row[requiredColumns.potGru]),
          potWavenet: parseNumericValue(row[requiredColumns.potWavenet])
        };

        // Validar datos mínimos
        if (!recordData.powerCompany || recordData.powerCompany === 'Desconocido') {
          console.log(`⚠️ Fila ${i + 1}: Empresa no válida, saltando...`);
          continue;
        }

        // Insertar en base de datos
        await prisma.residentialData.create({
          data: recordData
        });

        importedCount++;

        if (importedCount % 10 === 0) {
          console.log(`📈 Procesados ${importedCount} registros...`);
        }

      } catch (error) {
        errorCount++;
        console.log(`❌ Error en fila ${i + 1}:`, error.message);
        
        if (errorCount > 10) {
          console.log('⚠️ Demasiados errores, deteniendo importación...');
          break;
        }
      }
    }

    console.log('\n✅ Importación completada!');
    console.log(`📊 Registros importados: ${importedCount}`);
    console.log(`❌ Errores: ${errorCount}`);

    // Verificar datos importados
    const totalImported = await prisma.residentialData.count();
    console.log(`🗃️ Total en base de datos: ${totalImported}`);

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const excelPath = '/mnt/c/Documentos/DTEII/Ecuacier/Residencial_GLR.xlsx';
  importExcelData(excelPath);
}

module.exports = { importExcelData, readExcelFile };