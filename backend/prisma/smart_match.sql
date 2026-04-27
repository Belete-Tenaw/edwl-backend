-- Create the smart matching function with weighted scoring V2
CREATE OR REPLACE FUNCTION match_seekers_for_job(job_id UUID)
RETURNS TABLE (
    seeker_id UUID,
    match_score FLOAT,
    is_visible BOOLEAN
) AS $$
DECLARE
    job_record RECORD;
BEGIN
    -- Get job details
    SELECT * INTO job_record FROM "JobPost" WHERE id = job_id;

    RETURN QUERY
    SELECT 
        js.id AS seeker_id,
        (
            -- 1. Skills Match (30% weight)
            (COALESCE((
                SELECT COUNT(*)::FLOAT 
                FROM unnest(job_record."requiredSkills") s 
                WHERE s = ANY(js.skills)
            ), 0) / GREATEST(array_length(job_record."requiredSkills", 1), 1)) * 30.0 +

            -- 2. Language Match (10% weight)
            (CASE 
                WHEN array_length(js.languages, 1) > 0 AND EXISTS (
                    SELECT 1 FROM unnest(js.languages) lang 
                    WHERE job_record.description ILIKE '%' || lang || '%'
                ) THEN 10.0
                WHEN 'Amharic' = ANY(js.languages) OR 'English' = ANY(js.languages) THEN 5.0
                ELSE 0.0
            END) +

            -- 3. Location Proximity (15% weight)
            (CASE 
                WHEN js."locationWoreda" = job_record."locationWoreda" AND job_record."locationWoreda" IS NOT NULL THEN 15.0
                WHEN js."locationZone" = job_record."locationZone" AND job_record."locationZone" IS NOT NULL THEN 10.0
                WHEN js."preferredLocation" = job_record.address THEN 5.0
                ELSE 0.0 
            END) +

            -- 4. Economic Alignment (Salary) (10% weight)
            (CASE 
                WHEN js."expectedSalary" <= job_record."salaryOffered" THEN 10.0
                WHEN js."expectedSalary" <= job_record."salaryOffered" * 1.2 THEN 5.0
                ELSE 0.0 
            END) +

            -- 5. Experience Alignment (10% weight)
            (CASE 
                WHEN js."experienceYears" >= 5 THEN 10.0
                WHEN js."experienceYears" >= 2 THEN 7.0
                ELSE 3.0 
            END) +

            -- 6. Behavior Score (15% weight)
            (js."behaviorScore" / 100.0) * 15.0 +

            -- 7. Ratings (5% weight)
            (js.rating / 5.0) * 5.0 +

            -- 8. Tier Bonus (5% weight)
            (CASE 
                WHEN js.tier = 'PLATINUM' THEN 5.0
                WHEN js.tier = 'GOLD' THEN 3.0
                WHEN js.tier = 'SILVER' THEN 1.0
                ELSE 0.0 
            END)
        ) AS match_score,
        -- Visibility Logic
        (CASE 
            WHEN js.tier IN ('PLATINUM', 'GOLD') THEN TRUE
            WHEN js."behaviorScore" > 80 THEN TRUE
            WHEN match_score > 70 THEN TRUE
            ELSE FALSE 
        END) AS is_visible
    FROM "JobSeeker" js
    WHERE js."isActive" = TRUE
    ORDER BY match_score DESC
    LIMIT 25;
END;
$$ LANGUAGE plpgsql;
