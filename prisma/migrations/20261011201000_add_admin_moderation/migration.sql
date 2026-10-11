-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('ACTIVE', 'PENDING', 'SUSPENDED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "moderatedById" TEXT,
ADD COLUMN "moderatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "JobPost"
ADD COLUMN "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "moderatedById" TEXT,
ADD COLUMN "moderatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Application"
ADD COLUMN "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "moderatedById" TEXT,
ADD COLUMN "moderatedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Company"
ADD COLUMN "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN "moderatedById" TEXT,
ADD COLUMN "moderatedAt" TIMESTAMP(3);
