-- CreateEnum
CREATE TYPE "Cause" AS ENUM ('poverty', 'health', 'gender_based_violence', 'climate');

-- CreateEnum
CREATE TYPE "NetworkTechnology" AS ENUM ('g3', 'g4', 'g5', 'satellite', 'unknown');

-- CreateEnum
CREATE TYPE "SanctionRegime" AS ENUM ('eu', 'us', 'un', 'other');

-- AlterTable
ALTER TABLE "local_partner" ADD COLUMN     "causes" "Cause"[];

-- CreateTable
CREATE TABLE "country" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "microfinance_index" DECIMAL(4,2),
    "latest_survey_date" DATE,
    "microfinance_source_link_id" TEXT,
    "payment_providers" "PaymentProvider"[],
    "population_coverage" DECIMAL(5,2),
    "network_technology" "NetworkTechnology",
    "network_source_link_id" TEXT,
    "sanctions" "SanctionRegime"[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "country_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_link" (
    "id" TEXT NOT NULL,
    "href" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3),

    CONSTRAINT "source_link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "country_name_key" ON "country"("name");

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_microfinance_source_link_id_fkey" FOREIGN KEY ("microfinance_source_link_id") REFERENCES "source_link"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "country" ADD CONSTRAINT "country_network_source_link_id_fkey" FOREIGN KEY ("network_source_link_id") REFERENCES "source_link"("id") ON DELETE SET NULL ON UPDATE CASCADE;
