-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Support" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "widthM" REAL,
    "heightM" REAL,
    "latitude" REAL,
    "longitude" REAL,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "priceMonth" REAL,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "areaM2" REAL,
    "pricePerM2" REAL,
    "productionCost" REAL,
    "productionCostOverride" BOOLEAN NOT NULL DEFAULT false,
    "owner" TEXT,
    "imageUrl" TEXT,
    "companyId" TEXT,
    "dimensions" TEXT,
    "dailyImpressions" INTEGER,
    "lighting" BOOLEAN NOT NULL DEFAULT false,
    "tags" TEXT,
    "images" TEXT,
    "shortDescription" TEXT,
    "description" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL,
    "reviewsCount" INTEGER DEFAULT 0,
    "printingCost" REAL,
    "categoryId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Support_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Support_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Support" ("address", "areaM2", "available", "city", "code", "companyId", "country", "createdAt", "heightM", "id", "imageUrl", "latitude", "longitude", "owner", "priceMonth", "pricePerM2", "productionCost", "productionCostOverride", "status", "title", "type", "updatedAt", "widthM") SELECT "address", "areaM2", "available", "city", "code", "companyId", "country", "createdAt", "heightM", "id", "imageUrl", "latitude", "longitude", "owner", "priceMonth", "pricePerM2", "productionCost", "productionCostOverride", "status", "title", "type", "updatedAt", "widthM" FROM "Support";
DROP TABLE "Support";
ALTER TABLE "new_Support" RENAME TO "Support";
CREATE UNIQUE INDEX "Support_code_key" ON "Support"("code");
CREATE UNIQUE INDEX "Support_slug_key" ON "Support"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
