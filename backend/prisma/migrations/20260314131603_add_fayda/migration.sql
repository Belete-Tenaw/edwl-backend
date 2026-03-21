/*
  Warnings:

  - The `tier` column on the `Employer` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tier` column on the `JobSeeker` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `BlockedUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Voucher` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[faydaId]` on the table `Employer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referralCode]` on the table `Employer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telegramChatId]` on the table `Employer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[faydaId]` on the table `JobSeeker` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[referralCode]` on the table `JobSeeker` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[telegramChatId]` on the table `JobSeeker` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `tier` to the `SubscriptionTier` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SeekerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');

-- CreateEnum
CREATE TYPE "EmployerTier" AS ENUM ('FREE', 'SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS');

-- CreateEnum
CREATE TYPE "CodeType" AS ENUM ('TIME_EXTENSION', 'TRUST_UPGRADE');

-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "employerId" TEXT,
ADD COLUMN     "jobSeekerId" TEXT;

-- AlterTable
ALTER TABLE "Employer" ADD COLUMN     "badge" TEXT DEFAULT 'STANDARD',
ADD COLUMN     "faydaId" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFaydaVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordHint" TEXT,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referralCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referredById" TEXT,
ADD COLUMN     "referredByType" TEXT,
ADD COLUMN     "securityAnswer" TEXT,
ADD COLUMN     "securityQuestion" TEXT,
ADD COLUMN     "telegramChatId" TEXT,
DROP COLUMN "tier",
ADD COLUMN     "tier" "EmployerTier" NOT NULL DEFAULT 'FREE';

-- AlterTable
ALTER TABLE "JobSeeker" ADD COLUMN     "badge" TEXT DEFAULT 'STANDARD',
ADD COLUMN     "faydaId" TEXT,
ADD COLUMN     "featuredExpiry" TIMESTAMP(3),
ADD COLUMN     "guarantorIdUrl" TEXT,
ADD COLUMN     "guarantorPhone" TEXT,
ADD COLUMN     "healthCertificateUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isFaydaVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nationalIdUrl" TEXT,
ADD COLUMN     "passwordHint" TEXT,
ADD COLUMN     "policeClearanceUrl" TEXT,
ADD COLUMN     "priorityWeight" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referralCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referredById" TEXT,
ADD COLUMN     "referredByType" TEXT,
ADD COLUMN     "securityAnswer" TEXT,
ADD COLUMN     "securityQuestion" TEXT,
ADD COLUMN     "telegramChatId" TEXT,
ADD COLUMN     "videoBio" TEXT,
DROP COLUMN "tier",
ADD COLUMN     "tier" "SeekerTier" NOT NULL DEFAULT 'BRONZE';

-- AlterTable
ALTER TABLE "SubscriptionCode" ADD COLUMN     "codeType" "CodeType" NOT NULL DEFAULT 'TIME_EXTENSION',
ADD COLUMN     "tierUpgrade" "EmployerTier";

-- AlterTable
ALTER TABLE "SubscriptionTier" ADD COLUMN     "tier" TEXT NOT NULL;

-- DropTable
DROP TABLE "BlockedUser";

-- DropTable
DROP TABLE "Voucher";

-- DropEnum
DROP TYPE "UserTier";

-- CreateTable
CREATE TABLE "HiringRequirement" (
    "id" TEXT NOT NULL,
    "employerId" TEXT NOT NULL,
    "requirements" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HiringRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewerJSId" TEXT,
    "reviewerEmpId" TEXT,
    "targetJSId" TEXT,
    "targetEmpId" TEXT,
    "contractId" TEXT,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HiringRequirement_employerId_key" ON "HiringRequirement"("employerId");

-- CreateIndex
CREATE INDEX "Review_targetJSId_idx" ON "Review"("targetJSId");

-- CreateIndex
CREATE INDEX "Review_targetEmpId_idx" ON "Review"("targetEmpId");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_faydaId_key" ON "Employer"("faydaId");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_referralCode_key" ON "Employer"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "Employer_telegramChatId_key" ON "Employer"("telegramChatId");

-- CreateIndex
CREATE INDEX "Employer_tier_idx" ON "Employer"("tier");

-- CreateIndex
CREATE INDEX "Employer_createdAt_idx" ON "Employer"("createdAt");

-- CreateIndex
CREATE INDEX "JobPost_jobType_idx" ON "JobPost"("jobType");

-- CreateIndex
CREATE INDEX "JobPost_preferredArrangement_idx" ON "JobPost"("preferredArrangement");

-- CreateIndex
CREATE INDEX "JobPost_salaryOffered_idx" ON "JobPost"("salaryOffered");

-- CreateIndex
CREATE UNIQUE INDEX "JobSeeker_faydaId_key" ON "JobSeeker"("faydaId");

-- CreateIndex
CREATE UNIQUE INDEX "JobSeeker_referralCode_key" ON "JobSeeker"("referralCode");

-- CreateIndex
CREATE UNIQUE INDEX "JobSeeker_telegramChatId_key" ON "JobSeeker"("telegramChatId");

-- CreateIndex
CREATE INDEX "JobSeeker_tier_idx" ON "JobSeeker"("tier");

-- CreateIndex
CREATE INDEX "JobSeeker_createdAt_idx" ON "JobSeeker"("createdAt");

-- CreateIndex
CREATE INDEX "JobSeeker_isVerified_idx" ON "JobSeeker"("isVerified");

-- CreateIndex
CREATE INDEX "JobSeeker_preferredLocation_idx" ON "JobSeeker"("preferredLocation");

-- CreateIndex
CREATE INDEX "JobSeeker_experienceYears_idx" ON "JobSeeker"("experienceYears");

-- CreateIndex
CREATE INDEX "JobSeeker_expectedSalary_idx" ON "JobSeeker"("expectedSalary");

-- CreateIndex
CREATE INDEX "ViewLog_createdAt_idx" ON "ViewLog"("createdAt");

-- CreateIndex
CREATE INDEX "ViewLog_jobSeekerId_createdAt_idx" ON "ViewLog"("jobSeekerId", "createdAt");

-- CreateIndex
CREATE INDEX "ViewLog_employerId_createdAt_idx" ON "ViewLog"("employerId", "createdAt");

-- AddForeignKey
ALTER TABLE "HiringRequirement" ADD CONSTRAINT "HiringRequirement_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_contractId_fkey" FOREIGN KEY ("contractId") REFERENCES "Contract"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerEmpId_fkey" FOREIGN KEY ("reviewerEmpId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_reviewerJSId_fkey" FOREIGN KEY ("reviewerJSId") REFERENCES "JobSeeker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetEmpId_fkey" FOREIGN KEY ("targetEmpId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_targetJSId_fkey" FOREIGN KEY ("targetJSId") REFERENCES "JobSeeker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_employerId_fkey" FOREIGN KEY ("employerId") REFERENCES "Employer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;
