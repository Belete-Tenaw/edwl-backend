-- AlterTable
ALTER TABLE "JobPost" ADD COLUMN "locationRegion" TEXT,
ADD COLUMN "locationZone" TEXT,
ADD COLUMN "locationWoreda" TEXT,
ADD COLUMN "locationKebele" TEXT;

ALTER TABLE "JobSeeker" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN "resetPasswordToken" TEXT,
ADD COLUMN "liveSelfieUrl" TEXT,
ADD COLUMN "behaviorScore" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
ADD COLUMN "responseTimeMs" INTEGER;

ALTER TABLE "Employer" ADD COLUMN "resetPasswordExpires" TIMESTAMP(3),
ADD COLUMN "resetPasswordToken" TEXT,
ADD COLUMN "liveSelfieUrl" TEXT,
ADD COLUMN "behaviorScore" DOUBLE PRECISION NOT NULL DEFAULT 50.0,
ADD COLUMN "responseTimeMs" INTEGER;

ALTER TABLE "SubscriptionTier" ADD COLUMN "period" TEXT NOT NULL DEFAULT 'MONTHLY';

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('PENDING', 'FUNDED', 'RELEASED', 'DISPUTED');

-- CreateTable
CREATE TABLE "TrainingModule" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "videoUrl" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTraining" (
    "id" TEXT NOT NULL,
    "jobSeekerId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTraining_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowContract" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "jobId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'PENDING',
    "telebirrRef" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscrowContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserTraining_jobSeekerId_moduleId_key" ON "UserTraining"("jobSeekerId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowContract_telebirrRef_key" ON "EscrowContract"("telebirrRef");

-- AddForeignKey
ALTER TABLE "UserTraining" ADD CONSTRAINT "UserTraining_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTraining" ADD CONSTRAINT "UserTraining_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "TrainingModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowContract" ADD CONSTRAINT "EscrowContract_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowContract" ADD CONSTRAINT "EscrowContract_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPost"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowContract" ADD CONSTRAINT "EscrowContract_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "JobSeeker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "Contract_employerId_idx" ON "Contract"("employerId");

-- CreateIndex
CREATE INDEX "Contract_jobSeekerId_idx" ON "Contract"("jobSeekerId");

-- CreateIndex
CREATE INDEX "Contract_status_idx" ON "Contract"("status");

-- CreateIndex
CREATE INDEX "Contract_createdAt_idx" ON "Contract"("createdAt");

-- CreateIndex
CREATE INDEX "Employer_phone_idx" ON "Employer"("phone");

-- CreateIndex
CREATE INDEX "Employer_isActive_idx" ON "Employer"("isActive");

-- CreateIndex
CREATE INDEX "JobPost_locationRegion_idx" ON "JobPost"("locationRegion");

-- CreateIndex
CREATE INDEX "JobSeeker_phone_idx" ON "JobSeeker"("phone");

-- CreateIndex
CREATE INDEX "JobSeeker_isActive_idx" ON "JobSeeker"("isActive");

-- CreateIndex
CREATE INDEX "Payment_jobSeekerId_idx" ON "Payment"("jobSeekerId");

-- CreateIndex
CREATE INDEX "Payment_employerId_idx" ON "Payment"("employerId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");
