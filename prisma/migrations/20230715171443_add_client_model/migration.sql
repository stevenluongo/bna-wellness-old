-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "image" TEXT,
    "age" INTEGER,
    "homePhone" TEXT,
    "cellPhone" TEXT,
    "notes" TEXT[],

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);
