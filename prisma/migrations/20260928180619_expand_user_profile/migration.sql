/*
  Warnings:

  - Made the column `bio` on table `profile` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Availability" AS ENUM ('OPEN_TO_WORK', 'ACTIVELY_LOOKING', 'NOT_LOOKING');

-- AlterTable
ALTER TABLE "profile" ADD COLUMN     "availability" "Availability" NOT NULL DEFAULT 'OPEN_TO_WORK',
ADD COLUMN     "experienceYears" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "githubUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "headline" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "linkedinUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "location" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "portfolioUrl" TEXT NOT NULL DEFAULT '',
ALTER COLUMN "bio" SET NOT NULL,
ALTER COLUMN "bio" SET DEFAULT '';
