/*
  Warnings:

  - You are about to drop the `Cancellation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'default');

-- CreateEnum
CREATE TYPE "UserTitle" AS ENUM ('trainer', 'owner');

-- DropForeignKey
ALTER TABLE "Cancellation" DROP CONSTRAINT "Cancellation_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Cancellation" DROP CONSTRAINT "Cancellation_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Cancellation" DROP CONSTRAINT "Cancellation_trainerId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'default',
ADD COLUMN     "title" "UserTitle" NOT NULL DEFAULT 'trainer';

-- DropTable
DROP TABLE "Cancellation";

-- DropTable
DROP TABLE "Member";
