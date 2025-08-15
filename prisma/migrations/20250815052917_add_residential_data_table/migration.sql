-- CreateTable
CREATE TABLE "companies" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "population" INTEGER,
    "area" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "energy_records" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "model" TEXT NOT NULL,
    "energy" REAL NOT NULL,
    "accuracy" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "energy_records_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transmission_stations" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "voltage" REAL NOT NULL,
    "demand" REAL NOT NULL,
    "maxDemand" REAL NOT NULL,
    "stationType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "tariff" TEXT NOT NULL,
    "yearsRange" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "transmission_stations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prediction_history" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "targetYear" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "predictedValue" REAL NOT NULL,
    "actualValue" REAL,
    "predictionDate" DATETIME NOT NULL,
    "accuracy" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "model_configs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "parameters" JSONB NOT NULL,
    "lastTrained" DATETIME,
    "accuracy" REAL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "level" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "component" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "residential_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyId" INTEGER,
    "region" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "quarter" INTEGER,
    "energyConsumption" REAL NOT NULL,
    "energyDemand" REAL,
    "numberOfCustomers" INTEGER,
    "averageConsumption" REAL,
    "population" INTEGER,
    "households" INTEGER,
    "averageIncome" REAL,
    "urbanizationRate" REAL,
    "distributionLosses" REAL,
    "peakDemandHour" INTEGER,
    "loadFactor" REAL,
    "dataSource" TEXT,
    "dataQuality" TEXT,
    "modelType" TEXT,
    "confidence" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "residential_data_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "companies_code_key" ON "companies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "energy_records_companyId_category_year_month_model_key" ON "energy_records"("companyId", "category", "year", "month", "model");

-- CreateIndex
CREATE UNIQUE INDEX "model_configs_name_key" ON "model_configs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "residential_data_region_year_month_quarter_key" ON "residential_data"("region", "year", "month", "quarter");
