/*
  Warnings:

  - You are about to drop the column `eventId` on the `Check` table. All the data in the column will be lost.
  - The primary key for the `Week` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `date` on the `Week` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Week` table. All the data in the column will be lost.
  - You are about to drop the `Event` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `roomId` to the `Check` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `Week` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Check" DROP CONSTRAINT "Check_eventId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_roomId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_weekId_fkey";

-- AlterTable
ALTER TABLE "Check" DROP COLUMN "eventId",
ADD COLUMN     "roomId" TEXT NOT NULL,
ALTER COLUMN "weekStart" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Week" DROP CONSTRAINT "Week_pkey",
DROP COLUMN "date",
DROP COLUMN "id",
ADD COLUMN     "start" TEXT NOT NULL,
ADD CONSTRAINT "Week_pkey" PRIMARY KEY ("start");

-- DropTable
DROP TABLE "Event";

-- CreateTable
CREATE TABLE "_RoomToWeek" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_RoomToWeek_AB_unique" ON "_RoomToWeek"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomToWeek_B_index" ON "_RoomToWeek"("B");

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_weekStart_fkey" FOREIGN KEY ("weekStart") REFERENCES "Week"("start") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Check" ADD CONSTRAINT "Check_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToWeek" ADD CONSTRAINT "_RoomToWeek_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToWeek" ADD CONSTRAINT "_RoomToWeek_B_fkey" FOREIGN KEY ("B") REFERENCES "Week"("start") ON DELETE CASCADE ON UPDATE CASCADE;
