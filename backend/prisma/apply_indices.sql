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

