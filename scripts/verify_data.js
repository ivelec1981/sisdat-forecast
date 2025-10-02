const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verifyData() {
  try {
    console.log('🔍 Verificando datos importados...\n');

    // Contar registros totales
    const totalCount = await prisma.residentialData.count();
    console.log(`📊 Total de registros: ${totalCount}`);

    // Obtener todos los registros
    const data = await prisma.residentialData.findMany({
      orderBy: { date: 'asc' }
    });

    console.log('\n📋 Registros en la base de datos:');
    console.log('='.repeat(80));
    
    data.forEach((record, index) => {
      console.log(`\n${index + 1}. ID: ${record.id}`);
      console.log(`   Empresa: ${record.powerCompany}`);
      console.log(`   Fecha: ${record.date.toISOString().split('T')[0]}`);
      console.log(`   Tipo: ${record.type}`);
      console.log(`   Energía Combinada: ${record.enerComb} MWh`);
      console.log(`   Potencia Combinada: ${record.potComb} MW`);
      console.log(`   Modelos disponibles:`);
      console.log(`     - Prophet: ${record.enerProphet} MWh / ${record.potProphet} MW`);
      console.log(`     - GRU: ${record.enerGru} MWh / ${record.potGru} MW`);
      console.log(`     - WaveNet: ${record.enerWavenet} MWh / ${record.potWavenet} MW`);
      console.log(`     - GBR: ${record.enerGbr} MWh / ${record.potGbr} MW`);
    });

    // Estadísticas básicas
    if (data.length > 0) {
      console.log('\n📈 Estadísticas básicas:');
      console.log('='.repeat(50));
      
      const avgEnerComb = data.reduce((sum, r) => sum + (r.enerComb || 0), 0) / data.length;
      const avgPotComb = data.reduce((sum, r) => sum + (r.potComb || 0), 0) / data.length;
      
      console.log(`   Energía promedio: ${avgEnerComb.toFixed(2)} MWh`);
      console.log(`   Potencia promedio: ${avgPotComb.toFixed(2)} MW`);
      
      const companies = [...new Set(data.map(r => r.powerCompany))];
      console.log(`   Empresas: ${companies.join(', ')}`);
    }

    console.log('\n✅ Verificación completada!');

  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  verifyData();
}

module.exports = { verifyData };