-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'OPERATOR',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "partnerId" TEXT,
    CONSTRAINT "User_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "website" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "companyId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "soportes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "widthM" REAL,
    "heightM" REAL,
    "latitude" REAL,
    "longitude" REAL,
    "googleMapsLink" TEXT,
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
    "partnerId" TEXT,
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
    CONSTRAINT "soportes_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "soportes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "soportes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "companyName" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supportId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reservation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reservation_supportId_fkey" FOREIGN KEY ("supportId") REFERENCES "soportes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "kind" TEXT NOT NULL DEFAULT 'COMPANY',
    "relation" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "displayName" TEXT NOT NULL,
    "legalName" TEXT,
    "taxId" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "website" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postalCode" TEXT,
    "country" TEXT,
    "salesOwnerId" TEXT,
    "favorite" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contact_salesOwnerId_fkey" FOREIGN KEY ("salesOwnerId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContactTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT
);

-- CreateTable
CREATE TABLE "ContactTagOnContact" (
    "contactId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    PRIMARY KEY ("contactId", "tagId"),
    CONSTRAINT "ContactTagOnContact_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "ContactTag" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ContactTagOnContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_taxId_key" ON "Company"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "soportes_code_key" ON "soportes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "soportes_slug_key" ON "soportes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTag_name_key" ON "ContactTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
