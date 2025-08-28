/*
  Warnings:

  - You are about to drop the column `has_whatsapp_comm` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `has_whatsapp_mobile` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp_activated` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "user" DROP COLUMN "has_whatsapp_comm",
DROP COLUMN "has_whatsapp_mobile",
DROP COLUMN "whatsapp_activated",
ADD COLUMN     "communication_phone_has_whatsapp" BOOLEAN,
ADD COLUMN     "communication_phone_whatsapp_activated" BOOLEAN,
ADD COLUMN     "mobile_money_phone_has_whatsapp" BOOLEAN;
