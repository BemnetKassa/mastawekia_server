/*
  Warnings:

  - You are about to drop the column `skill` on the `profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "profile" DROP COLUMN "skill",
ADD COLUMN     "skills" TEXT[];
