-- DropForeignKey
ALTER TABLE "contribution" DROP CONSTRAINT "contribution_subscription_id_fkey";

-- DropIndex
DROP INDEX "contribution_subscription_id_idx";

-- AlterTable
ALTER TABLE "contribution" DROP COLUMN "subscription_id";
