import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addProjectedData() {
  console.log('Adding projected data for 2025 and power data...');

  const companies = await prisma.company.findMany();
  const categories = ['res', 'com', 'ind', 'ap', 'otr'];
  const models = ['prophet', 'gru', 'wavenet', 'gbr', 'ensemble'];
  const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const projectedRecords = [];

  // Datos proyectados para 2025
  for (const company of companies.slice(0, 3)) { // Solo primeras 3 empresas
    for (const category of categories) {
      for (const month of months) {
        for (const model of models) {
          // Base values para energía mensual (sumatoria mensual del año)
          const energyBaseValues = {
            res: company.population ? company.population * 0.028 : 14000, // MWh mensual
            com: company.population ? company.population * 0.014 : 7000,
            ind: company.population ? company.population * 0.012 : 6000,
            ap: company.population ? company.population * 0.0025 : 1250,
            otr: company.population ? company.population * 0.0045 : 2250
          };

          // Para potencia (máxima del año) - valores más altos que energía mensual
          const powerBaseValues = {
            res: company.population ? company.population * 0.035 : 17500, // MW máximo
            com: company.population ? company.population * 0.018 : 9000,
            ind: company.population ? company.population * 0.015 : 7500,
            ap: company.population ? company.population * 0.003 : 1500,
            otr: company.population ? company.population * 0.0055 : 2750
          };
          
          const energyBaseValue = energyBaseValues[category as keyof typeof energyBaseValues];
          const powerBaseValue = powerBaseValues[category as keyof typeof powerBaseValues];
          
          // Variación estacional para energía
          const seasonalFactor = month >= 6 && month <= 8 ? 1.2 : 
                                 month >= 12 || month <= 2 ? 1.15 : 1.0;
          
          // Crecimiento proyectado vs 2024
          const growthFactor = 1.05 + Math.random() * 0.1; // 5-15% crecimiento
          
          // Variación por modelo
          const modelVariation = 0.95 + Math.random() * 0.1; // ±5%
          
          // Calcular energía y potencia
          const energy = energyBaseValue * seasonalFactor * growthFactor * modelVariation;
          const power = powerBaseValue * (1 + (Math.random() - 0.5) * 0.3) * growthFactor; // Más variabilidad en potencia
          
          const accuracy = 85 + Math.random() * 15; // 85-100% precisión para proyecciones

          // Registro de energía mensual
          projectedRecords.push({
            companyId: company.id,
            category,
            year: 2025,
            month,
            model,
            energy: Math.round(energy * 100) / 100,
            accuracy: Math.round(accuracy * 100) / 100
          });

          // Para potencia, solo crear un registro anual (mes = null) con el valor máximo
          if (month === 1) { // Solo crear una vez por año
            projectedRecords.push({
              companyId: company.id,
              category,
              year: 2025,
              month: null,
              model,
              energy: Math.round(power * 100) / 100, // Usamos el campo energy para almacenar potencia
              accuracy: Math.round(accuracy * 100) / 100
            });
          }
        }
      }
    }
  }

  // También agregar registros de potencia para 2024 (históricos)
  for (const company of companies.slice(0, 3)) {
    for (const category of categories) {
      const powerBaseValues = {
        res: company.population ? company.population * 0.032 : 16000, // MW máximo histórico
        com: company.population ? company.population * 0.016 : 8000,
        ind: company.population ? company.population * 0.013 : 6500,
        ap: company.population ? company.population * 0.0028 : 1400,
        otr: company.population ? company.population * 0.0050 : 2500
      };

      const powerBaseValue = powerBaseValues[category as keyof typeof powerBaseValues];
      const power = powerBaseValue * (1 + (Math.random() - 0.5) * 0.2);

      // Registro de potencia histórica para 2024
      projectedRecords.push({
        companyId: company.id,
        category,
        year: 2024,
        month: null, // null indica que es un valor anual de potencia
        model: 'hist',
        energy: Math.round(power * 100) / 100, // Potencia máxima del año
        accuracy: 100
      });
    }
  }

  // Insertar en lotes
  const batchSize = 50;
  for (let i = 0; i < projectedRecords.length; i += batchSize) {
    const batch = projectedRecords.slice(i, i + batchSize);
    await prisma.energyRecord.createMany({
      data: batch
    });
  }

  console.log(`Created ${projectedRecords.length} projected and power records`);
  console.log('Projected data added successfully!');
}

addProjectedData()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });