-- DropIndex
DROP INDEX "donation_certificate_contributor_id_year_key";

-- AlterTable
ALTER TABLE "donation_certificate" ADD COLUMN     "language" TEXT;
