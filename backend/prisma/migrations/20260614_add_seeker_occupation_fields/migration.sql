-- Add startup-governance occupation capture for seeker profiles.
-- Nullable fields preserve existing registrations and support future categories.
ALTER TABLE "JobSeeker" ADD COLUMN "occupationCategory" TEXT;
ALTER TABLE "JobSeeker" ADD COLUMN "customOccupation" TEXT;

CREATE INDEX "JobSeeker_occupationCategory_idx" ON "JobSeeker"("occupationCategory");
