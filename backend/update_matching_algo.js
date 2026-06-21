const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateMatchingAlgo() {
    console.log("Updating match_seekers_for_job function...");

    const sqlDrop = `DROP FUNCTION IF EXISTS match_seekers_for_job(UUID);`;

    const sqlCreate = `
CREATE OR REPLACE FUNCTION match_seekers_for_job(p_job_id UUID)
RETURNS TABLE (
    "seekerId" UUID,
    "fullName" TEXT,
    "match_score" INT,
    "tier" "SeekerTier",
    "is_visible" BOOLEAN,
    "behaviorScore" FLOAT,
    "locationWoreda" TEXT,
    "rating" FLOAT,
    "skills_match_count" INT
) AS $$
DECLARE
    v_employer_tier "EmployerTier";
    v_job_skills TEXT[];
    v_job_salary INT;
    v_job_location TEXT;
    v_sub_expiry TIMESTAMPTZ;
BEGIN
    -- 1. Get employer tier for visibility/subscription check
    SELECT e.tier, e."subscriptionExpiry" INTO v_employer_tier, v_sub_expiry
    FROM "JobPost" jp
    JOIN "Employer" e ON jp."employerId"::text = e.id::text
    WHERE jp.id::text = p_job_id::text;

    IF v_employer_tier IS NULL OR v_sub_expiry IS NULL OR v_sub_expiry < NOW() THEN 
        v_employer_tier := 'FREE'; 
    END IF;

    -- 2. Get job details
    SELECT "requiredSkills", "salaryOffered", "address" INTO v_job_skills, v_job_salary, v_job_location
    FROM "JobPost"
    WHERE id::text = p_job_id::text;

    RETURN QUERY
    WITH potential_matches AS (
        SELECT 
            js.id::UUID as s_id,
            js."fullName" as s_name,
            js.tier as s_tier,
            -- A. SKILLS SCORE: max 20 points
            (
                CASE WHEN array_length(v_job_skills, 1) > 0 THEN
                    (
                        SELECT LEAST((COUNT(*)::FLOAT / array_length(v_job_skills, 1)::FLOAT * 20)::INT, 20)
                        FROM UNNEST(js.skills) s
                        WHERE s = ANY(v_job_skills)
                    )
                ELSE 20 END
            ) as score_skills,
            -- B. EXPERIENCE SCORE: max 10 points (JobSeekers with >= 1 year get 10 pts)
            (CASE WHEN js."experienceYears" >= 1 THEN 10 ELSE 5 END) as score_exp,
            -- C. SALARY ALIGNMENT: max 20 points
            (CASE WHEN js."expectedSalary" <= v_job_salary THEN 20 
                  WHEN js."expectedSalary" <= v_job_salary * 1.2 THEN 10
                  ELSE 0 END) as score_salary,
            -- D. LOCATION PROXIMITY: max 30 points (simple substring overlap)
            (CASE WHEN js."preferredLocation" ILIKE '%' || v_job_location || '%' 
                    OR v_job_location ILIKE '%' || js."preferredLocation" || '%' THEN 30 
                  ELSE 0 END) as score_loc,

            -- --- RELIABILITY VELOCITY ENGINE ---
            -- E. MOMENTUM: Recent activity heavily weighted (max 20 pts)
            LEAST((js."completedJobs" * 2.0)::INT, 20) as score_momentum,

            -- F. RESPONSIVENESS: Efficiency bonus based on responseTimeMs (ideal=15 mins or 900k ms) (max 10 pts)
            LEAST((900000.0 / COALESCE(NULLIF(js."responseTimeMs", 0), 900000)) * 10.0, 10)::INT as score_response,

            -- G. QUALITY vs RISK: Combines NLP behaviorScore and Employer Rating (max 20 pts)
            LEAST((js."behaviorScore" / 100.0 * 10.0 + js."rating" / 5.0 * 10.0), 20)::INT as score_quality,

            -- H. TIER TRUST MULTIPLIER: Treated as an additive boost (max 20 pts)
            (CASE WHEN js.tier = 'PLATINUM' THEN 20 
                  WHEN js.tier = 'GOLD' THEN 15 
                  WHEN js.tier = 'SILVER' THEN 10 
                  ELSE 0 END) as score_tier_boost,
            
            -- I. Skills match count (added for richer returning fields)
            (
                CASE WHEN array_length(v_job_skills, 1) > 0 THEN
                    (
                        SELECT COUNT(*)::INT
                        FROM UNNEST(js.skills) s
                        WHERE s = ANY(v_job_skills)
                    )
                ELSE 0 END
            ) as skills_match_count,
            js."behaviorScore" as behavior_score,
            js."locationWoreda" as location_woreda,
            js.rating as rating_val
        FROM "JobSeeker" js
        WHERE js."isActive" = true
    )
    SELECT 
        s_id,
        s_name,
        -- Final Match Score is a combination of traditional fit + Reliability Velocity
        (COALESCE(score_skills, 0) + COALESCE(score_exp, 0) + COALESCE(score_salary, 0) + COALESCE(score_loc, 0) 
         + COALESCE(score_momentum, 0) + COALESCE(score_response, 0) + COALESCE(score_quality, 0) + COALESCE(score_tier_boost, 0))::INT as s_score,
        s_tier,
        TRUE as is_visible, -- Always Return TRUE for the "Teaser" Strategy, masking happens on the frontend via access lock overlay
        behavior_score,
        location_woreda,
        rating_val,
        skills_match_count
    FROM potential_matches
    WHERE (COALESCE(score_skills, 0) + COALESCE(score_exp, 0) + COALESCE(score_salary, 0) + COALESCE(score_loc, 0)) > 0
    ORDER BY s_score DESC, s_tier DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
    `;

    try {
        await prisma.$executeRawUnsafe(sqlDrop);
        await prisma.$executeRawUnsafe(sqlCreate);
        console.log("Successfully updated match_seekers_for_job database function!");
    } catch (e) {
        console.error("Failed to update database function:", e);
    } finally {
        await prisma.$disconnect();
    }
}

updateMatchingAlgo();
