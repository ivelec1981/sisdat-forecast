const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getFinalDataSummary() {
  try {
    console.log('📊 RESUMEN FINAL DE DATOS IMPORTADOS');
    console.log('='.repeat(60));

    // Contar registros totales
    const totalCount = await prisma.residentialData.count();
    console.log(`\n📈 Total de registros: ${totalCount}`);

    // Estadísticas por empresa
    const companiesStats = await prisma.residentialData.groupBy({
      by: ['powerCompany'],
      _count: { id: true },
      _avg: {
        enerComb: true,
        potComb: true
      }
    });

    console.log('\n🏢 ESTADÍSTICAS POR EMPRESA:');
    console.log('-'.repeat(50));
    companiesStats.forEach(stat => {
      console.log(`${stat.powerCompany}:`);
      console.log(`  - Registros: ${stat._count.id}`);
      console.log(`  - Energía promedio: ${stat._avg.enerComb?.toFixed(2)} MWh`);
      console.log(`  - Potencia promedio: ${stat._avg.potComb?.toFixed(2)} MW\n`);
    });

    // Rango de fechas
    const dateRange = await prisma.residentialData.aggregate({
      _min: { date: true },
      _max: { date: true }
    });

    console.log('📅 RANGO TEMPORAL:');
    console.log('-'.repeat(30));
    console.log(`Desde: ${dateRange._min.date?.toISOString().split('T')[0]}`);
    console.log(`Hasta: ${dateRange._max.date?.toISOString().split('T')[0]}`);

    // Estadísticas por tipo
    const typeStats = await prisma.residentialData.groupBy({
      by: ['type'],
      _count: { id: true }
    });

    console.log('\n📋 TIPOS DE DATOS:');
    console.log('-'.repeat(25));
    typeStats.forEach(stat => {
      console.log(`${stat.type}: ${stat._count.id} registros`);
    });

    // Estadísticas globales
    const globalStats = await prisma.residentialData.aggregate({
      _avg: {
        enerComb: true,
        enerProphet: true,
        enerGru: true,
        enerWavenet: true,
        enerGbr: true,
        potComb: true,
        potProphet: true,
        potGru: true,
        potWavenet: true,
        potGbr: true
      },
      _min: {
        enerComb: true,
        potComb: true
      },
      _max: {
        enerComb: true,
        potComb: true
      }
    });

    console.log('\n⚡ ESTADÍSTICAS GLOBALES DE ENERGÍA (MWh):');
    console.log('-'.repeat(45));
    console.log(`Energía Combinada - Promedio: ${globalStats._avg.enerComb?.toFixed(2)}`);
    console.log(`Energía Combinada - Mínimo: ${globalStats._min.enerComb?.toFixed(2)}`);
    console.log(`Energía Combinada - Máximo: ${globalStats._max.enerComb?.toFixed(2)}`);
    
    console.log('\n🔌 ESTADÍSTICAS GLOBALES DE POTENCIA (MW):');
    console.log('-'.repeat(45));
    console.log(`Potencia Combinada - Promedio: ${globalStats._avg.potComb?.toFixed(2)}`);
    console.log(`Potencia Combinada - Mínimo: ${globalStats._min.potComb?.toFixed(2)}`);
    console.log(`Potencia Combinada - Máximo: ${globalStats._max.potComb?.toFixed(2)}`);

    console.log('\n🤖 PRECISIÓN DE MODELOS (Energía MWh):');
    console.log('-'.repeat(40));
    console.log(`Prophet: ${globalStats._avg.enerProphet?.toFixed(2)}`);
    console.log(`GRU: ${globalStats._avg.enerGru?.toFixed(2)}`);
    console.log(`WaveNet: ${globalStats._avg.enerWavenet?.toFixed(2)}`);
    console.log(`GBR: ${globalStats._avg.enerGbr?.toFixed(2)}`);

    // Registros más recientes
    const recentRecords = await prisma.residentialData.findMany({
      orderBy: { date: 'desc' },
      take: 3,
      select: {
        powerCompany: true,
        date: true,
        type: true,
        enerComb: true,
        potComb: true
      }
    });

    console.log('\n📅 REGISTROS MÁS RECIENTES:');
    console.log('-'.repeat(35));
    recentRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.powerCompany} - ${record.date.toISOString().split('T')[0]}`);
      console.log(`   Energía: ${record.enerComb} MWh | Potencia: ${record.potComb} MW`);
    });

    console.log('\n✅ ¡IMPORTACIÓN COMPLETADA EXITOSAMENTE!');
    console.log('🎯 Los datos están listos para ser utilizados en las proyecciones.');

  } catch (error) {
    console.error('❌ Error generando resumen:', error);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  getFinalDataSummary();
}

module.exports = { getFinalDataSummary };