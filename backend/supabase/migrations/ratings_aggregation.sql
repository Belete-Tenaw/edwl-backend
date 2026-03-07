-- Function to update JobSeeker average rating
CREATE OR REPLACE FUNCTION update_job_seeker_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        IF (OLD."targetJSId" IS NOT NULL) THEN
            UPDATE "JobSeeker"
            SET rating = COALESCE((
                SELECT AVG(rating)::FLOAT
                FROM "Review"
                WHERE "targetJSId" = OLD."targetJSId"
            ), 0.0)
            WHERE id = OLD."targetJSId";
        END IF;
        RETURN OLD;
    ELSE
        IF (NEW."targetJSId" IS NOT NULL) THEN
            UPDATE "JobSeeker"
            SET rating = COALESCE((
                SELECT AVG(rating)::FLOAT
                FROM "Review"
                WHERE "targetJSId" = NEW."targetJSId"
            ), 0.0)
            WHERE id = NEW."targetJSId";
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for JobSeeker
DROP TRIGGER IF EXISTS trigger_update_job_seeker_rating ON "Review";
CREATE TRIGGER trigger_update_job_seeker_rating
AFTER INSERT OR UPDATE OR DELETE ON "Review"
FOR EACH ROW
EXECUTE FUNCTION update_job_seeker_rating();

-- Function to update Employer average rating
CREATE OR REPLACE FUNCTION update_employer_rating()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        IF (OLD."targetEmpId" IS NOT NULL) THEN
            UPDATE "Employer"
            SET rating = COALESCE((
                SELECT AVG(rating)::FLOAT
                FROM "Review"
                WHERE "targetEmpId" = OLD."targetEmpId"
            ), 0.0)
            WHERE id = OLD."targetEmpId";
        END IF;
        RETURN OLD;
    ELSE
        IF (NEW."targetEmpId" IS NOT NULL) THEN
            UPDATE "Employer"
            SET rating = COALESCE((
                SELECT AVG(rating)::FLOAT
                FROM "Review"
                WHERE "targetEmpId" = NEW."targetEmpId"
            ), 0.0)
            WHERE id = NEW."targetEmpId";
        END IF;
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Trigger for Employer
DROP TRIGGER IF EXISTS trigger_update_employer_rating ON "Review";
CREATE TRIGGER trigger_update_employer_rating
AFTER INSERT OR UPDATE OR DELETE ON "Review"
FOR EACH ROW
EXECUTE FUNCTION update_employer_rating();
