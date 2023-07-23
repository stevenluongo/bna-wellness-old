/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Terminal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Terminal" DROP COLUMN "createdAt",
ADD COLUMN     "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
