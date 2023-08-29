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
ALTER TABLE "_RoomToWeek" ADD CONSTRAINT "_RoomToWeek_A_fkey" FOREIGN KEY ("A") REFERENCES "Room"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RoomToWeek" ADD CONSTRAINT "_RoomToWeek_B_fkey" FOREIGN KEY ("B") REFERENCES "Week"("start") ON DELETE CASCADE ON UPDATE CASCADE;
