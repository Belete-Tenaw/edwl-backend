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
            -- 1. Skills Match (40% weight)
            (COALESCE((
                SELECT COUNT(*)::FLOAT 
                FROM unnest(job_record."requiredSkills") s 
                WHERE s = ANY(js.skills)
            ), 0) / GREATEST(array_length(job_record."requiredSkills", 1), 1)) * 40.0 +

            -- 2. Location Proximity (20% weight)
            (CASE 
                WHEN js."locationWoreda" = job_record."locationWoreda" AND job_record."locationWoreda" IS NOT NULL THEN 20.0
                WHEN js."locationZone" = job_record."locationZone" AND job_record."locationZone" IS NOT NULL THEN 10.0
                WHEN js."preferredLocation" = job_record.address THEN 5.0 -- Fallback to general address match
                ELSE 0.0 
            END) +

            -- 3. Behavior Score (20% weight)
            (js."behaviorScore" / 100.0) * 20.0 +

            -- 4. Ratings (10% weight)
            (js.rating / 5.0) * 10.0 +

            -- 5. Tier Bonus (10% weight)
            (CASE 
                WHEN js.tier = 'PLATINUM' THEN 10.0
                WHEN js.tier = 'GOLD' THEN 7.0
                WHEN js.tier = 'SILVER' THEN 4.0
                ELSE 0.0 
            END)
        ) AS match_score,
        -- Business Logic: Elite workers (Score > 85) or Premium tiers are visible
        (CASE 
            WHEN js.tier IN ('PLATINUM', 'GOLD') THEN TRUE
            WHEN js."behaviorScore" > 85 THEN TRUE
            WHEN match_score > 75 THEN TRUE
            ELSE FALSE 
        END) AS is_visible
    FROM "JobSeeker" js
    WHERE js."isActive" = TRUE
    ORDER BY match_score DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;
