import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkData() {
  try {
    const count = await prisma.publicLightingData.count();
    console.log('✅ Total registros de alumbrado público:', count);
    
    if (count > 0) {
      const sample = await prisma.publicLightingData.findMany({
        take: 3,
        orderBy: { date: 'asc' }
      });
      
      console.log('\n📄 Muestra de datos:');
      sample.forEach((record, i) => {
        console.log(`   ${i+1}. ${record.powerCompany} - ${record.date.toISOString().split('T')[0]} - Energía Prophet: ${record.enerProphet} MWh`);
      });
      
      const stats = await prisma.publicLightingData.aggregate({
        _avg: {
          enerProphet: true,
          potProphet: true
        },
        _min: {
          date: true
        },
        _max: {
          date: true
        }
      });
      
      console.log('\n📊 Estadísticas:');
      console.log(`   🔋 Promedio energía Prophet: ${stats._avg.enerProphet?.toFixed(2)} MWh`);
      console.log(`   ⚡ Promedio potencia Prophet: ${stats._avg.potProphet?.toFixed(2)} MW`);
      console.log(`   📅 Período: ${stats._min.date?.toISOString().split('T')[0]} - ${stats._max.date?.toISOString().split('T')[0]}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();