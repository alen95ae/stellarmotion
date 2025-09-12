-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MANAGER', 'OPERATOR');

-- CreateEnum
CREATE TYPE "public"."ResStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."ContactKind" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "public"."ContactRelation" AS ENUM ('CUSTOMER', 'SUPPLIER', 'BOTH');

-- CreateEnum
CREATE TYPE "public"."SupportStatus" AS ENUM ('DISPONIBLE', 'OCUPADO', 'RESERVADO', 'NO_DISPONIBLE');

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taxId" TEXT,
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."soportes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "slug" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "widthM" DOUBLE PRECISION,
    "heightM" DOUBLE PRECISION,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "priceMonth" DOUBLE PRECISION,
    "available" BOOLEAN NOT NULL DEFAULT true,
    "status" "public"."SupportStatus" NOT NULL DEFAULT 'DISPONIBLE',
    "areaM2" DOUBLE PRECISION,
    "pricePerM2" DOUBLE PRECISION,
    "productionCost" DOUBLE PRECISION,
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
    "rating" DOUBLE PRECISION,
    "reviewsCount" INTEGER DEFAULT 0,
    "printingCost" DOUBLE PRECISION,
    "categoryId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "soportes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Reservation" (
    "id" TEXT NOT NULL,
    "supportId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "public"."ResStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Contact" (
    "id" TEXT NOT NULL,
    "kind" "public"."ContactKind" NOT NULL DEFAULT 'COMPANY',
    "relation" "public"."ContactRelation" NOT NULL DEFAULT 'CUSTOMER',
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactTag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "ContactTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ContactTagOnContact" (
    "contactId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "ContactTagOnContact_pkey" PRIMARY KEY ("contactId","tagId")
);

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "iconKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Company_taxId_key" ON "public"."Company"("taxId");

-- CreateIndex
CREATE UNIQUE INDEX "soportes_code_key" ON "public"."soportes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "soportes_slug_key" ON "public"."soportes"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTag_name_key" ON "public"."ContactTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "public"."Category"("slug");

-- AddForeignKey
ALTER TABLE "public"."Client" ADD CONSTRAINT "Client_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."soportes" ADD CONSTRAINT "soportes_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."soportes" ADD CONSTRAINT "soportes_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Reservation" ADD CONSTRAINT "Reservation_supportId_fkey" FOREIGN KEY ("supportId") REFERENCES "public"."soportes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Contact" ADD CONSTRAINT "Contact_salesOwnerId_fkey" FOREIGN KEY ("salesOwnerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactTagOnContact" ADD CONSTRAINT "ContactTagOnContact_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."ContactTag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ContactTagOnContact" ADD CONSTRAINT "ContactTagOnContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "public"."Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
