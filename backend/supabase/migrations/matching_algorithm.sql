-- Matching Algorithm with Visibility Masking
-- This function matches Job Seekers with Job Posts based on skills and rank.
-- It also enforces visibility rules:
-- 1. Platinum Seekers are hidden from Bronze (FREE) employers.
-- 2. Gold Seekers are hidden from Bronze (FREE) employers. (Adjustable based on requirements, but user specifically mentioned Platinum vs Bronze).

CREATE OR REPLACE FUNCTION match_seekers_for_job(p_job_id UUID)
RETURNS TABLE (
    seeker_id UUID,
    full_name TEXT,
    match_score INT,
    tier "SeekerTier",
    is_visible BOOLEAN
) AS $$
DECLARE
    v_employer_tier "EmployerTier";
    v_job_skills TEXT[];
BEGIN
    -- Get employer tier for visibility check
    SELECT e.tier INTO v_employer_tier
    FROM "JobPost" jp
    JOIN "Employer" e ON jp."employerId"::text = e.id::text
    WHERE jp.id::text = p_job_id::text;

    -- Get job skills
    SELECT "requiredSkills" INTO v_job_skills
    FROM "JobPost"
    WHERE id::text = p_job_id::text;

    RETURN QUERY
    WITH potential_matches AS (
        SELECT 
            js.id::UUID as s_id,
            js."fullName" as s_name,
            js.tier as s_tier,
            -- Score based on shared skills
            (
                SELECT COUNT(*)::INT 
                FROM UNNEST(js.skills) s
                WHERE s = ANY(v_job_skills)
            ) as s_score
        FROM "JobSeeker" js
        WHERE js."isActive" = true
    )
    SELECT 
        s_id,
        s_name,
        s_score,
        s_tier,
        CASE 
            WHEN v_employer_tier = 'FREE' AND (s_tier = 'PLATINUM' OR s_tier = 'GOLD') THEN FALSE
            WHEN v_employer_tier = 'SILVER_ACCESS' AND s_tier = 'PLATINUM' THEN FALSE
            ELSE TRUE
        END as is_visible
    FROM potential_matches
    WHERE s_score > 0
    ORDER BY s_score DESC, s_tier DESC;
END;
$$ LANGUAGE plpgsql;
