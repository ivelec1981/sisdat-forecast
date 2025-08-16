import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addMonthlyData() {
  console.log('Adding monthly data for 2024...');

  const companies = await prisma.company.findMany();
  const categories = ['res', 'com', 'ind', 'ap', 'otr'];
  const models = ['hist', 'prophet'];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const monthlyRecords = [];

  for (const company of companies.slice(0, 3)) { // Solo primeras 3 empresas
    for (const category of categories) {
      for (const month of months) {
        for (const model of models) {
          // Base values by category and company size
          const baseValues = {
            res: company.population ? company.population * 0.025 : 12500, // Mensual
            com: company.population ? company.population * 0.012 : 6000,
            ind: company.population ? company.population * 0.010 : 5000,
            ap: company.population ? company.population * 0.002 : 1200,
            otr: company.population ? company.population * 0.004 : 2000
          };
          
          const baseValue = baseValues[category as keyof typeof baseValues];
          
          // Variación estacional (verano más consumo)
          const seasonalFactor = month >= 6 && month <= 8 ? 1.15 : 
                                 month >= 12 || month <= 2 ? 1.1 : 1.0;
          
          // Variación por modelo
          const modelVariation = model === 'hist' ? 1.0 : 0.95 + Math.random() * 0.1;
          
          const energy = baseValue * seasonalFactor * modelVariation;
          const accuracy = model === 'hist' ? 100 : 90 + Math.random() * 10;

          monthlyRecords.push({
            companyId: company.id,
            category,
            year: 2024,
            month,
            model,
            energy: Math.round(energy * 100) / 100,
            accuracy: Math.round(accuracy * 100) / 100
          });
        }
      }
    }
  }

  // Insertar en lotes
  const batchSize = 50;
  for (let i = 0; i < monthlyRecords.length; i += batchSize) {
    const batch = monthlyRecords.slice(i, i + batchSize);
    await prisma.energyRecord.createMany({
      data: batch
    });
  }

  console.log(`Created ${monthlyRecords.length} monthly energy records for 2024`);
}

addMonthlyData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });