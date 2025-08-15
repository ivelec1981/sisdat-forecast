import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addPredictionHistory() {
  console.log('Adding prediction history...');

  const companies = await prisma.company.findMany();
  const categories = ['res', 'com', 'ind', 'ap', 'otr'];
  const models = ['prophet', 'gru', 'wavenet', 'gbr', 'ensemble'];

  const predictionHistory = [];

  // Crear historial de predicciones para los últimos 30 días
  for (let days = 30; days >= 0; days--) {
    const predictionDate = new Date();
    predictionDate.setDate(predictionDate.getDate() - days);

    for (const company of companies.slice(0, 3)) { // Solo primeras 3 empresas
      for (const category of categories.slice(0, 3)) { // Solo primeras 3 categorías
        for (const model of models.slice(0, 3)) { // Solo primeros 3 modelos
          const baseValue = {
            res: 150 + Math.random() * 50,
            com: 80 + Math.random() * 30,
            ind: 120 + Math.random() * 40,
            ap: 25 + Math.random() * 15,
            otr: 35 + Math.random() * 20
          }[category] || 100;

          const predictedValue = baseValue + (Math.random() - 0.5) * 20;
          const actualValue = baseValue + (Math.random() - 0.5) * 15; // Valor real con menos variación
          
          const error = Math.abs(actualValue - predictedValue) / actualValue;
          const accuracy = (1 - error) * 100;

          predictionHistory.push({
            companyId: company.id,
            category,
            targetYear: 2024,
            model,
            predictedValue: Math.round(predictedValue * 100) / 100,
            actualValue: Math.round(actualValue * 100) / 100,
            predictionDate,
            accuracy: Math.round(accuracy * 100) / 100
          });
        }
      }
    }
  }

  // Insertar en lotes
  const batchSize = 50;
  for (let i = 0; i < predictionHistory.length; i += batchSize) {
    const batch = predictionHistory.slice(i, i + batchSize);
    await prisma.predictionHistory.createMany({
      data: batch
    });
  }

  console.log(`Created ${predictionHistory.length} prediction history records`);

  // Agregar datos residenciales de ejemplo
  const residentialData = [];
  
  for (let days = 30; days >= 0; days--) {
    const date = new Date();
    date.setDate(date.getDate() - days);

    for (const company of companies.slice(0, 5)) {
      const baseEnergy = 150 + Math.random() * 100;
      const basePower = 25 + Math.random() * 15;

      residentialData.push({
        powerCompany: company.name,
        date,
        type: 'residential',
        enerComb: baseEnergy + (Math.random() - 0.5) * 10,
        enerProphet: baseEnergy + (Math.random() - 0.5) * 8,
        enerGru: baseEnergy + (Math.random() - 0.5) * 12,
        enerWavenet: baseEnergy + (Math.random() - 0.5) * 15,
        enerGbr: baseEnergy + (Math.random() - 0.5) * 7,
        potComb: basePower + (Math.random() - 0.5) * 2,
        potProphet: basePower + (Math.random() - 0.5) * 1.5,
        potGru: basePower + (Math.random() - 0.5) * 2.5,
        potWavenet: basePower + (Math.random() - 0.5) * 3,
        potGbr: basePower + (Math.random() - 0.5) * 1.2
      });
    }
  }

  // Insertar datos residenciales en lotes
  for (let i = 0; i < residentialData.length; i += batchSize) {
    const batch = residentialData.slice(i, i + batchSize);
    await prisma.residentialData.createMany({
      data: batch
    });
  }

  console.log(`Created ${residentialData.length} residential data records`);
  console.log('Prediction history added successfully!');
}

addPredictionHistory()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });