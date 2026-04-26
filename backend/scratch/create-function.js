const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sql = `
CREATE OR REPLACE FUNCTION get_seeker_visibility_with_id(
  p_seeker_id UUID,
  p_viewer_tier TEXT
)
RETURNS JSONB AS $$
DECLARE
  v_seeker RECORD;
  v_is_masked BOOLEAN;
BEGIN
  -- Get seeker data
  SELECT 
    id, "fullName", skills, "experienceYears", tier, rating, "profilePhoto", phone, email
  INTO v_seeker 
  FROM "JobSeeker" 
  WHERE id = p_seeker_id;
  
  -- If seeker not found, return NULL
  IF v_seeker.id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Logic: Mask if viewer is FREE.
  v_is_masked := (p_viewer_tier = 'FREE');

  RETURN jsonb_build_object(
    'id', v_seeker.id,
    'fullName', v_seeker."fullName",
    'skills', v_seeker.skills,
    'experienceYears', v_seeker."experienceYears",
    'tier', v_seeker.tier,
    'rating', v_seeker.rating,
    'profilePhoto', v_seeker."profilePhoto",
    'is_visible', NOT v_is_masked,
    'phone', CASE WHEN v_is_masked THEN '********' ELSE v_seeker.phone END,
    'email', CASE WHEN v_is_masked THEN '********' ELSE v_seeker.email END
  );
END;
$$ LANGUAGE plpgsql;
`;

async function main() {
  try {
    await prisma.$executeRawUnsafe(sql);
    console.log('Function get_seeker_visibility_with_id created successfully');
  } catch (e) {
    console.error('Error creating function:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
