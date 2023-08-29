/*
  Warnings:

  - You are about to drop the `_RoomToWeek` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_RoomToWeek" DROP CONSTRAINT "_RoomToWeek_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoomToWeek" DROP CONSTRAINT "_RoomToWeek_B_fkey";

-- DropTable
DROP TABLE "_RoomToWeek";
