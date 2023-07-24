/*
  Warnings:

  - You are about to drop the column `userId` on the `Check` table. All the data in the column will be lost.
  - Added the required column `trainerId` to the `Check` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Check" DROP CONSTRAINT "Check_userId_fkey";

-- AlterTable
ALTER TABLE "Check" DROP COLUMN "userId",
ADD COLUMN     "trainerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
