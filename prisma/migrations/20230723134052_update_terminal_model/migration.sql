/*
  Warnings:

  - You are about to drop the column `userId` on the `Terminal` table. All the data in the column will be lost.
  - Added the required column `openedById` to the `Terminal` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Terminal" DROP CONSTRAINT "Terminal_userId_fkey";

-- AlterTable
ALTER TABLE "Terminal" DROP COLUMN "userId",
ADD COLUMN     "openedById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Terminal" ADD CONSTRAINT "Terminal_openedById_fkey" FOREIGN KEY ("openedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
