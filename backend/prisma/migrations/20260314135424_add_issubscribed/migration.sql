-- AlterTable
ALTER TABLE "Employer" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "JobSeeker" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false;
