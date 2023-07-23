/*
  Warnings:

  - The primary key for the `TerminalLog` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `updatedAt` on the `TerminalLog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TerminalLog" DROP CONSTRAINT "TerminalLog_pkey",
DROP COLUMN "updatedAt",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "TerminalLog_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "TerminalLog_id_seq";
