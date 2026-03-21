-- Create the smart matching function with weighted scoring
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
            -- 1. Skills Match (50% weight)
            -- Count how many required skills the seeker has
            (COALESCE((
                SELECT COUNT(*)::FLOAT 
                FROM unnest(job_record."requiredSkills") s 
                WHERE s = ANY(js.skills)
            ), 0) / GREATEST(array_length(job_record."requiredSkills", 1), 1)) * 50.0 +

            -- 2. Location Match (20% weight)
            (CASE WHEN js."preferredLocation" = job_record.address THEN 20.0 ELSE 0.0 END) +

            -- 3. Arrangement Match (20% weight)
            (CASE WHEN js."preferredArrangement" = job_record."preferredArrangement" THEN 20.0 ELSE 0.0 END) +

            -- 4. Tier Bonus (10% weight)
            (CASE 
                WHEN js.tier = 'PLATINUM' THEN 10.0
                WHEN js.tier = 'GOLD' THEN 7.0
                WHEN js.tier = 'SILVER' THEN 4.0
                ELSE 0.0 
            END)
        ) AS match_score,
        -- Business Logic: Platinum/Gold are always visible, others depend on score
        (CASE 
            WHEN js.tier IN ('PLATINUM', 'GOLD') THEN TRUE
            WHEN match_score > 70 THEN TRUE
            ELSE FALSE 
        END) AS is_visible
    FROM "JobSeeker" js
    WHERE js."isActive" = TRUE
    ORDER BY match_score DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;
