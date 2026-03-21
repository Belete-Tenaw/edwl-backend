const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateDbVisibilityFunction() {
    console.log("Updating get_seeker_visibility_with_id function...");

    const sqlDrop = `DROP FUNCTION IF EXISTS get_seeker_visibility_with_id(TEXT);`;
    const sqlCreate = `
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
    `;

    try {
        await prisma.$executeRawUnsafe(sqlDrop);
        await prisma.$executeRawUnsafe(sqlCreate);
        console.log("Successfully updated database function!");
    } catch (e) {
        console.error("Failed to update database function:", e);
    } finally {
        await prisma.$disconnect();
    }
}

updateDbVisibilityFunction();
