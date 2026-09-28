/*
  Warnings:

  - You are about to drop the column `isOpen` on the `JobPost` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Application" ALTER COLUMN "coverLetter" DROP DEFAULT,
ALTER COLUMN "resumeUrl" DROP DEFAULT,
ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "JobPost" DROP COLUMN "isOpen";
