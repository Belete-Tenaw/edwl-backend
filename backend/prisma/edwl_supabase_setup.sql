-- EDWL Zero-Cost Engine - Supabase Schema & RLS
-- Architect: Antigravity AI

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE "SeekerTier" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EmployerTier" AS ENUM ('FREE', 'SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update JobSeeker Table (Ensure fields exist)
ALTER TABLE "JobSeeker" 
ADD COLUMN IF NOT EXISTS "nationalIdUrl" TEXT,
ADD COLUMN IF NOT EXISTS "guarantorIdUrl" TEXT,
ADD COLUMN IF NOT EXISTS "guarantorPhone" TEXT,
ADD COLUMN IF NOT EXISTS "healthCertificateUrl" TEXT,
ADD COLUMN IF NOT EXISTS "policeClearanceUrl" TEXT;

-- 3. Create PremiumCode Table
CREATE TABLE IF NOT EXISTS "PremiumCode" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "code" TEXT UNIQUE NOT NULL,
    "tier" "EmployerTier" NOT NULL,
    "durationDays" INTEGER NOT NULL,
    "status" TEXT DEFAULT 'UNUSED',
    "createdAt" TIMESTAMPTZ DEFAULT now(),
    "expiresAt" TIMESTAMPTZ NOT NULL
);

-- 4. Enable RLS
ALTER TABLE "JobSeeker" ENABLE ROW LEVEL SECURITY;

-- 5. Helper Function to get Current Employer Tier
CREATE OR REPLACE FUNCTION get_current_employer_tier()
RETURNS "EmployerTier" AS $$
    SELECT tier FROM "Employer" WHERE id = auth.uid()::text LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 6. RLS Policy for Masking (The "Cascade" and "Gold Masking Platinum" Rule)
-- Instead of masking in a single policy (which can't change row values),
-- we recommend using a VIEW for filtered data access, while RLS protects the raw table.

CREATE OR REPLACE VIEW "SeekerVisibilityView" AS
SELECT 
    id,
    "fullName",
    "profilePhoto",
    -- Masking Logic:
    CASE 
        WHEN (get_current_employer_tier() = 'PLATINUM_ACCESS') THEN tier::text
        WHEN (get_current_employer_tier() = 'GOLD_ACCESS' AND tier = 'PLATINUM') THEN 'GOLD'
        WHEN (get_current_employer_tier() = 'GOLD_ACCESS') THEN tier::text
        WHEN (get_current_employer_tier() = 'SILVER_ACCESS' AND tier IN ('GOLD', 'PLATINUM')) THEN 'SILVER'
        WHEN (get_current_employer_tier() = 'SILVER_ACCESS') THEN tier::text
        ELSE 'BRONZE' -- FREE seekers see everyone as BRONZE or limited
    END as display_tier,
    -- Address Masking
    CASE 
        WHEN (get_current_employer_tier() != 'FREE') THEN "preferredLocation"
        ELSE '********'
    END as address,
    -- Contact Masking (Visible for SILVER and above)
    CASE 
        WHEN (get_current_employer_tier() IN ('SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS')) THEN phone
        ELSE '********'
    END as phone,
    CASE 
        WHEN (get_current_employer_tier() IN ('SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS')) THEN email
        ELSE '********'
    END as email,
    -- Document Visibility based on cascade AND Verification Status
    CASE WHEN get_current_employer_tier() IN ('SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS') AND "verificationStatus" = 'APPROVED' THEN "nationalIdUrl" ELSE NULL END as fayda,
    CASE WHEN get_current_employer_tier() IN ('GOLD_ACCESS', 'PLATINUM_ACCESS') AND "verificationStatus" = 'APPROVED' THEN "guarantorIdUrl" ELSE NULL END as guarantor,
    CASE WHEN get_current_employer_tier() IN ('GOLD_ACCESS', 'PLATINUM_ACCESS') AND "verificationStatus" = 'APPROVED' THEN "guarantorPhone" ELSE NULL END as guarantor_phone,
    CASE WHEN get_current_employer_tier() = 'PLATINUM_ACCESS' AND "verificationStatus" = 'APPROVED' THEN "healthCertificateUrl" ELSE NULL END as health,
    CASE WHEN get_current_employer_tier() = 'PLATINUM_ACCESS' AND "verificationStatus" = 'APPROVED' THEN "policeClearanceUrl" ELSE NULL END as police
FROM "JobSeeker";

-- 7. Premium Code Activation RPC
CREATE OR REPLACE FUNCTION activate_premium_code(user_id TEXT, input_code TEXT)
RETURNS JSONB AS $$
DECLARE
    code_record RECORD;
    expiry_date TIMESTAMPTZ;
BEGIN
    -- 1. Check code
    SELECT * INTO code_record FROM "PremiumCode" WHERE code = input_code AND status = 'UNUSED' AND "expiresAt" > now();
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Invalid, used, or expired code');
    END IF;

    -- 2. Calculate expiry
    expiry_date := now() + (code_record."durationDays" || ' days')::interval;

    -- 3. Update Employer
    UPDATE "Employer" SET 
        tier = code_record.tier,
        "subscriptionExpiry" = expiry_date
    WHERE id = user_id;

    -- 4. Mark code as used
    UPDATE "PremiumCode" SET status = 'USED' WHERE id = code_record.id;

    RETURN jsonb_build_object('success', true, 'new_tier', code_record.tier, 'expiry', expiry_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Parameter-based Masking Function for Backend
DROP FUNCTION IF EXISTS get_seeker_visibility_with_id(TEXT);

CREATE OR REPLACE FUNCTION get_seeker_visibility_with_id(emp_id TEXT)
RETURNS TABLE (
    id UUID,
    "fullName" TEXT,
    "profilePhoto" TEXT,
    "gender" "Gender",
    "age" INT,
    "skills" TEXT[],
    "experienceYears" INT,
    "expectedSalary" INT,
    "preferredArrangement" "PreferredArrangement",
    "bio" TEXT,
    "rating" FLOAT,
    display_tier TEXT,
    badge TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    fayda TEXT,
    guarantor TEXT,
    guarantor_phone TEXT,
    health TEXT,
    police TEXT
) AS $$
DECLARE
    emp_tier "EmployerTier";
    emp_sub_expiry TIMESTAMPTZ;
BEGIN
    SELECT tier, "subscriptionExpiry" INTO emp_tier, emp_sub_expiry FROM "Employer" WHERE "Employer".id = emp_id LIMIT 1;
    
    -- Dual-Layer Rule: If subscription is expired or null, reset their access tier to FREE
    IF emp_tier IS NULL OR emp_sub_expiry IS NULL OR emp_sub_expiry < NOW() THEN 
        emp_tier := 'FREE'; 
    END IF;

    RETURN QUERY
    SELECT 
        "JobSeeker".id,
        "JobSeeker"."fullName",
        "JobSeeker"."profilePhoto",
        "JobSeeker".gender,
        "JobSeeker".age,
        "JobSeeker".skills,
        "JobSeeker"."experienceYears",
        "JobSeeker"."expectedSalary",
        "JobSeeker"."preferredArrangement",
        "JobSeeker".bio,
        "JobSeeker".rating,
        CASE 
            WHEN (emp_tier = 'PLATINUM_ACCESS') THEN tier::text
            WHEN (emp_tier = 'GOLD_ACCESS' AND tier = 'PLATINUM') THEN 'GOLD'
            WHEN (emp_tier = 'GOLD_ACCESS') THEN tier::text
            WHEN (emp_tier = 'SILVER_ACCESS' AND tier IN ('GOLD', 'PLATINUM')) THEN 'SILVER'
            WHEN (emp_tier = 'SILVER_ACCESS') THEN tier::text
            ELSE 'BRONZE'
        END as display_tier,
        "JobSeeker".badge,
        CASE WHEN (emp_tier != 'FREE') THEN "preferredLocation" ELSE '********' END as address,
        CASE WHEN (emp_tier IN ('SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS')) AND "verificationStatus" = 'APPROVED' THEN "JobSeeker".phone ELSE '********' END as phone,
        CASE WHEN (emp_tier IN ('SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS')) AND "verificationStatus" = 'APPROVED' THEN "JobSeeker".email ELSE '********' END as email,
        CASE WHEN emp_tier IN ('SILVER_ACCESS', 'GOLD_ACCESS', 'PLATINUM_ACCESS') AND "verificationStatus" = 'APPROVED' THEN "nationalIdUrl" ELSE NULL END as fayda,
        CASE WHEN emp_tier IN ('GOLD_ACCESS', 'PLATINUM_ACCESS') AND "verificationStatus" = 'APPROVED' THEN "guarantorIdUrl" ELSE NULL END as guarantor,
        CASE WHEN emp_tier IN ('GOLD_ACCESS', 'PLATINUM_ACCESS') AND "verificationStatus" = 'APPROVED' THEN "guarantorPhone" ELSE NULL END as guarantor_phone,
        CASE WHEN emp_tier = 'PLATINUM_ACCESS' AND "verificationStatus" = 'APPROVED' THEN "healthCertificateUrl" ELSE NULL END as health,
        CASE WHEN emp_tier = 'PLATINUM_ACCESS' AND "verificationStatus" = 'APPROVED' THEN "policeClearanceUrl" ELSE NULL END as police
    FROM "JobSeeker"
    WHERE "JobSeeker"."isActive" = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
