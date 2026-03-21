-- Optimized Matching Algorithm (100-Point System)
-- Improved with Geo-Tiering, Recency Weighting, and array intersection performance
-- Inspired by LinkedIn/Indeed ranking models

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
    v_sub_expiry TIMESTAMPTZ;
    v_job_skills TEXT[];
    v_job_salary INT;
    v_job_woreda TEXT;
    v_job_zone TEXT;
    v_job_region TEXT;
BEGIN
    -- 1. Get job and employer details
    SELECT 
        jp."requiredSkills", jp."salaryOffered", 
        jp."locationWoreda", jp."locationZone", jp."locationRegion",
        e.tier, e."subscriptionExpiry"
    INTO 
        v_job_skills, v_job_salary, 
        v_job_woreda, v_job_zone, v_job_region,
        v_employer_tier, v_sub_expiry
    FROM "JobPost" jp
    JOIN "Employer" e ON jp."employerId"::text = e.id::text
    WHERE jp.id::text = p_job_id::text;

    -- Subscription fallback
    IF v_employer_tier IS NULL OR v_sub_expiry IS NULL OR v_sub_expiry < NOW() THEN 
        v_employer_tier := 'FREE'; 
    END IF;

    RETURN QUERY
    WITH potential_matches AS (
        SELECT 
            js.id::UUID as s_id,
            js."fullName" as s_name,
            js.tier as s_tier,
            -- A. SKILLS SCORE (25 pts) - Using array intersection (&&)
            (
                CASE WHEN array_length(v_job_skills, 1) > 0 THEN
                    LEAST((cardinality(array(SELECT unnest(js.skills) INTERSECT SELECT unnest(v_job_skills)))::FLOAT / array_length(v_job_skills, 1)::FLOAT * 25)::INT, 25)
                ELSE 25 END
            ) as score_skills,
            -- B. EXPERIENCE SCORE (10 pts)
            (CASE WHEN js."experienceYears" >= 1 THEN 10 ELSE 5 END) as score_exp,
            -- C. SALARY ALIGNMENT (15 pts) - Linear decay is better but buckets are safer for now
            (CASE WHEN js."expectedSalary" <= v_job_salary THEN 15 
                  WHEN js."expectedSalary" <= v_job_salary * 1.2 THEN 7
                  ELSE 0 END) as score_salary,
            -- D. GEO-TIERED LOCATION (20 pts)
            (CASE WHEN js."locationWoreda" = v_job_woreda THEN 20
                  WHEN js."locationZone" = v_job_zone THEN 12
                  WHEN js."locationRegion" = v_job_region THEN 5
                  ELSE 0 END) as score_loc,
            -- E. TRUST & TIER (10 pts)
            (
                CASE WHEN js.tier = 'PLATINUM' THEN 6
                     WHEN js.tier = 'GOLD' THEN 4
                     WHEN js.tier = 'SILVER' THEN 2
                     ELSE 0 END
                + CASE WHEN js."isVerified" = true THEN 4 ELSE 0 END
            ) as score_trust,
            -- F. RECENCY BOOST (10 pts) - Freshness is key (LinkedIn/Indeed style)
            (
                CASE WHEN js."updatedAt" > (NOW() - INTERVAL '24 hours') THEN 10
                     WHEN js."updatedAt" > (NOW() - INTERVAL '7 days') THEN 5
                     ELSE 0 END
            ) as score_recency,
            -- G. ENGAGEMENT SCORE (5 pts) - LinkedIn Style: Reward active responders
            (
                SELECT LEAST((COUNT(*)::FLOAT * 2)::INT, 5)
                FROM "Message" m
                WHERE m."senderJSId" = js.id AND m.timestamp > (NOW() - INTERVAL '48 hours')
            ) as score_engagement,
            -- H. FEATURED & PRIORITY (5 pts)
            (
                CASE WHEN js."isFeatured" = true AND js."featuredExpiry" > NOW() THEN 5
                     ELSE LEAST(js."priorityWeight", 5) END
            ) as score_featured
        FROM "JobSeeker" js
        WHERE js."isActive" = true
    )
    SELECT 
        s_id,
        s_name,
        (COALESCE(score_skills, 0) + COALESCE(score_exp, 0) + COALESCE(score_salary, 0) + 
         COALESCE(score_loc, 0) + COALESCE(score_trust, 0) + COALESCE(score_recency, 0) + 
         COALESCE(score_engagement, 0) + COALESCE(score_featured, 0))::INT as s_score,
        s_tier,
        TRUE as is_visible 
    FROM potential_matches
    WHERE (COALESCE(score_skills, 0) + COALESCE(score_exp, 0) + COALESCE(score_salary, 0) + 
           COALESCE(score_loc, 0) + COALESCE(score_trust, 0) + COALESCE(score_recency, 0) + 
           COALESCE(score_engagement, 0) + COALESCE(score_featured, 0)) > 20 -- Minimum threshold to reduce noise
    ORDER BY s_score DESC, s_tier DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
