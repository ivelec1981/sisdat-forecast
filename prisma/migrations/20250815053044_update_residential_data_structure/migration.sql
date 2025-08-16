/*
  Warnings:

  - You are about to drop the column `averageConsumption` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `averageIncome` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `confidence` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `dataQuality` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `dataSource` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `distributionLosses` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `energyConsumption` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `energyDemand` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `households` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `loadFactor` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `modelType` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `month` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `numberOfCustomers` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `peakDemandHour` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `population` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `quarter` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `region` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `urbanizationRate` on the `residential_data` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `residential_data` table. All the data in the column will be lost.
  - Added the required column `date` to the `residential_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `powerCompany` to the `residential_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `residential_data` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_residential_data" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "powerCompany" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "type" TEXT NOT NULL,
    "enerComb" REAL,
    "enerProphet" REAL,
    "enerGru" REAL,
    "enerWavenet" REAL,
    "enerGbr" REAL,
    "potComb" REAL,
    "potProphet" REAL,
    "potGbr" REAL,
    "potGru" REAL,
    "potWavenet" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_residential_data" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "residential_data";
DROP TABLE "residential_data";
ALTER TABLE "new_residential_data" RENAME TO "residential_data";
CREATE UNIQUE INDEX "residential_data_powerCompany_date_type_key" ON "residential_data"("powerCompany", "date", "type");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
