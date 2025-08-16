import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpiar datos existentes
  await prisma.energyRecord.deleteMany();
  await prisma.transmissionStation.deleteMany();
  await prisma.company.deleteMany();
  await prisma.modelConfig.deleteMany();

  console.log('Seeding database...');

  // Crear empresas distribuidoras
  const companies = [
    { name: 'E.E. Quito', code: 'EEQ', region: 'Sierra Norte', population: 2800000, area: 15000 },
    { name: 'CNEL-Guayaquil', code: 'CNEL-GYE', region: 'Costa Sur', population: 3200000, area: 18000 },
    { name: 'CNEL-Manabi', code: 'CNEL-MAN', region: 'Costa Norte', population: 1400000, area: 22000 },
    { name: 'E.E. Centro Sur', code: 'EECS', region: 'Sierra Centro', population: 800000, area: 12000 },
    { name: 'E.E. Norte', code: 'EEN', region: 'Sierra Norte', population: 600000, area: 8000 },
    { name: 'CNEL-El Oro', code: 'CNEL-ORO', region: 'Costa Sur', population: 700000, area: 6000 },
    { name: 'CNEL-Esmeraldas', code: 'CNEL-ESM', region: 'Costa Norte', population: 550000, area: 15000 },
    { name: 'CNEL-Los Rios', code: 'CNEL-LR', region: 'Costa Centro', population: 900000, area: 7000 },
    { name: 'CNEL-Bolivar', code: 'CNEL-BOL', region: 'Sierra Centro', population: 200000, area: 4000 },
    { name: 'E.E. Ambato', code: 'EEA', region: 'Sierra Centro', population: 450000, area: 3500 }
  ];

  const createdCompanies = await Promise.all(
    companies.map(company => 
      prisma.company.create({ data: company })
    )
  );

  console.log(`Created ${createdCompanies.length} companies`);

  // Crear configuración de modelos
  const models = [
    { name: 'hist', displayName: 'Histórico', isActive: true, parameters: {}, accuracy: 100 },
    { name: 'prophet', displayName: 'Prophet', isActive: true, parameters: { seasonality: 'yearly' }, accuracy: 94.2 },
    { name: 'gru', displayName: 'GRU', isActive: true, parameters: { units: 128, epochs: 100 }, accuracy: 91.8 },
    { name: 'wavenet', displayName: 'WaveNet', isActive: true, parameters: { layers: 10 }, accuracy: 89.5 },
    { name: 'gbr', displayName: 'Gradient Boosting', isActive: true, parameters: { n_estimators: 100 }, accuracy: 92.3 },
    { name: 'ensemble', displayName: 'Ensemble', isActive: true, parameters: { models: ['prophet', 'gru', 'gbr'] }, accuracy: 95.1 }
  ];

  await Promise.all(
    models.map(model =>
      prisma.modelConfig.create({ data: model })
    )
  );

  console.log(`Created ${models.length} model configurations`);

  // Crear datos energéticos de ejemplo (basados en los datos reales del archivo)
  const categories = ['res', 'com', 'ind', 'ap', 'otr'];
  const years = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];
  
  const energyRecords = [];

  for (const company of createdCompanies.slice(0, 5)) { // Solo para las primeras 5 empresas
    for (const category of categories) {
      // Base values by category and company size
      const baseValues = {
        res: company.population ? company.population * 0.3 : 150000,
        com: company.population ? company.population * 0.15 : 75000,
        ind: company.population ? company.population * 0.12 : 60000,
        ap: company.population ? company.population * 0.03 : 15000,
        otr: company.population ? company.population * 0.05 : 25000
      };
      
      const baseValue = baseValues[category as keyof typeof baseValues];

      for (const year of years) {
        const isHistorical = year <= 2024;
        const modelsToUse = isHistorical ? ['hist'] : ['prophet', 'gru', 'wavenet', 'gbr', 'ensemble'];
        
        for (const model of modelsToUse) {
          // Calcular valor con crecimiento anual y variación por modelo
          const growthRate = 0.03 + Math.random() * 0.02; // 3-5% anual
          const yearMultiplier = Math.pow(1 + growthRate, year - 2020);
          
          let modelVariation = 1;
          if (model !== 'hist') {
            modelVariation = 0.95 + Math.random() * 0.1; // ±5% variación entre modelos
          }
          
          const energy = baseValue * yearMultiplier * modelVariation;
          const accuracy = model === 'hist' ? 100 : models.find(m => m.name === model)?.accuracy;

          energyRecords.push({
            companyId: company.id,
            category,
            year,
            model,
            energy: Math.round(energy * 100) / 100,
            accuracy
          });
        }
      }
    }
  }

  // Crear registros en lotes para mejor performance
  const batchSize = 100;
  for (let i = 0; i < energyRecords.length; i += batchSize) {
    const batch = energyRecords.slice(i, i + batchSize);
    await prisma.energyRecord.createMany({
      data: batch
    });
  }

  console.log(`Created ${energyRecords.length} energy records`);

  // Crear estaciones de transmisión
  const stationTypes = ['Subestación', 'Central', 'Switchyard'];
  const statuses = ['activa', 'mantenimiento', 'en_construccion'];
  const sectors = ['residencial', 'industrial', 'comercial', 'mixto'];
  const tariffs = ['residencial', 'comercial', 'industrial', 'alumbrado_publico'];

  const transmissionStations = [];

  for (const company of createdCompanies) {
    const stationCount = Math.floor(Math.random() * 8) + 3; // 3-10 estaciones por empresa
    
    for (let i = 0; i < stationCount; i++) {
      // Coordenadas aproximadas de Ecuador
      const lat = -4.5 + Math.random() * 6; // Entre aproximadamente -4.5 y 1.5
      const lng = -81 + Math.random() * 6; // Entre aproximadamente -81 y -75
      
      const voltage = [22, 69, 138, 230, 500][Math.floor(Math.random() * 5)];
      const maxDemand = 50 + Math.random() * 200; // 50-250 MW
      const demand = maxDemand * (0.6 + Math.random() * 0.3); // 60-90% de la demanda máxima

      transmissionStations.push({
        companyId: company.id,
        name: `S/E ${company.name.split(' ').pop()} ${i + 1}`,
        lat,
        lng,
        voltage,
        demand: Math.round(demand * 100) / 100,
        maxDemand: Math.round(maxDemand * 100) / 100,
        stationType: stationTypes[Math.floor(Math.random() * stationTypes.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        tariff: tariffs[Math.floor(Math.random() * tariffs.length)],
        yearsRange: '2020-2024'
      });
    }
  }

  await prisma.transmissionStation.createMany({
    data: transmissionStations
  });

  console.log(`Created ${transmissionStations.length} transmission stations`);

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });