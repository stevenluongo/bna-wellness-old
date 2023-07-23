/*
  Warnings:

  - The primary key for the `Terminal` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "TerminalLog" DROP CONSTRAINT "TerminalLog_terminalId_fkey";

-- AlterTable
ALTER TABLE "Terminal" DROP CONSTRAINT "Terminal_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Terminal_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Terminal_id_seq";

-- AlterTable
ALTER TABLE "TerminalLog" ALTER COLUMN "terminalId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "TerminalLog" ADD CONSTRAINT "TerminalLog_terminalId_fkey" FOREIGN KEY ("terminalId") REFERENCES "Terminal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
