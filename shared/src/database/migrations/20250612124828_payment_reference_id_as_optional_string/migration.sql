-- AlterTable
ALTER TABLE "user" ALTER COLUMN "paymentReferenceId" DROP NOT NULL,
ALTER COLUMN "paymentReferenceId" SET DATA TYPE TEXT;
