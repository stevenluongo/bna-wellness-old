/*
  Warnings:

  - The values [admin,default] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - The values [trainer,owner] on the enum `UserTitle` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('ADMIN', 'DEFAULT');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "UserRole_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'DEFAULT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserTitle_new" AS ENUM ('TRAINER', 'OWNER', 'THERAPIST');
ALTER TABLE "User" ALTER COLUMN "title" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "title" TYPE "UserTitle_new" USING ("title"::text::"UserTitle_new");
ALTER TYPE "UserTitle" RENAME TO "UserTitle_old";
ALTER TYPE "UserTitle_new" RENAME TO "UserTitle";
DROP TYPE "UserTitle_old";
ALTER TABLE "User" ALTER COLUMN "title" SET DEFAULT 'TRAINER';
COMMIT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'DEFAULT',
ALTER COLUMN "title" SET DEFAULT 'TRAINER';
