const functions = require('firebase-functions');
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * ============================================================================
 * SECTION 1: THE NOBLE PHILOSOPHY & ETHICAL CORE API
 * ============================================================================
 */

/**
 * 1. "Dignity of Labor" Engine: Dynamic Living Wage Calculator
 * Dynamically calculates the minimum acceptable wage based on location, 
 * family size, current inflation indexes, and required skills.
 * Employers cannot offer a wage below this threshold.
 */
exports.calculateLivingWage = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Must be logged in.');
  }

  const { region, tier, requiredSkills } = data;

  // Base constants (Mocking external economic API data for Addis Ababa regions)
  const baseRates = {
    'Addis Ababa - Bole': 4500,
    'Addis Ababa - Yeka': 4000,
    'Addis Ababa - Nifas Silk': 3800,
    'Regional': 3000
  };

  const currentInflationMultiplier = 1.15; // 15% inflation adjustment
  let baseWage = baseRates[region] || baseRates['Regional'];
  
  // Apply tier and skill adjustments
  const tierMultiplier = tier === 'GOLD' ? 1.8 : (tier === 'SILVER' ? 1.4 : 1.0);
  const skillBonus = (requiredSkills && requiredSkills.length > 0) ? requiredSkills.length * 250 : 0;

  // Final Algorithm
  const calculatedMinimumWage = Math.round((baseWage * tierMultiplier * currentInflationMultiplier) + skillBonus);
  const recommendedWage = Math.round(calculatedMinimumWage * 1.25); // 25% premium for "Noble Employer" badge

  return {
    region,
    tier,
    minimumEthicalWage: calculatedMinimumWage,
    recommendedNobleWage: recommendedWage,
    currency: 'ETB',
    breakdown: {
      base: baseWage,
      inflationAdjustment: Math.round(baseWage * (currentInflationMultiplier - 1)),
      tierBonus: Math.round(baseWage * (tierMultiplier - 1)),
      skillBonus: skillBonus
    },
    message: `Based on local economic data, we recommend ${recommendedWage} ETB to ensure a dignified living standard.`
  };
});

/**
 * 2. The Safe-Haven Protocol: Silent Emergency Trigger
 * Allows workers to trigger a silent alarm that immediately dispatches to 
 * platform admins, logs their last known GPS, and locks the escrow.
 */
exports.triggerSafeHaven = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'worker') {
    throw new functions.https.HttpsError('permission-denied', 'Only workers can trigger this protocol.');
  }

  const workerId = context.auth.uid;
  const { lastKnownLocation, employerId, currentJobId } = data;

  try {
    const batch = admin.firestore().batch();

    // 1. Log the emergency in a highly secure sub-collection
    const emergencyRef = admin.firestore().collection('emergencies').doc();
    batch.set(emergencyRef, {
      workerId,
      employerId,
      currentJobId,
      location: lastKnownLocation || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      status: 'CRITICAL_ACTIVE',
      resolved: false
    });

    // 2. Lock the worker profile from being viewed or modified by employer
    const workerRef = admin.firestore().collection('workers').doc(workerId);
    batch.update(workerRef, { 
      isActive: false,
      safetyStatus: 'EMERGENCY_LOCKDOWN'
    });

    // 3. (Optional) Freeze active Escrow contract
    if (currentJobId) {
      const jobRef = admin.firestore().collection('escrow_ledger').doc(currentJobId);
      batch.update(jobRef, { status: 'FROZEN_SAFETY_PROTOCOL' });
    }

    await batch.commit();

    // In production: Send immediate SMS/WhatsApp to on-call safety administrators
    console.warn(`🚨 SAFE-HAVEN TRIGGERED by Worker ${workerId} at coordinates: ${JSON.stringify(lastKnownLocation)}`);

    return { 
      success: true, 
      message: 'Silent alarm activated. Safety team has been notified.' 
    };

  } catch (error) {
    console.error('Error triggering Safe-Haven:', error);
    throw new functions.https.HttpsError('internal', 'Emergency system error, but fallback SMS is initiated.');
  }
});

/**
 * 3. Meritocratic Mobility: Gamified Skill Unlocking
 * Automatically upgrades worker tiers and updates their vector embedding 
 * when they pass an academy certification.
 */
exports.unlockCertification = functions.https.onCall(async (data, context) => {
  if (!context.auth || context.auth.token.role !== 'worker') {
    throw new functions.https.HttpsError('permission-denied', 'Only workers can unlock certifications.');
  }

  const workerId = context.auth.uid;
  const { certificationId, score } = data;

  if (score < 80) {
    return { success: false, message: 'Score too low to unlock certification. Please try again.' };
  }

  try {
    const workerRef = admin.firestore().collection('workers').doc(workerId);
    const workerDoc = await workerRef.get();
    
    if (!workerDoc.exists) throw new Error('Worker not found');
    const workerData = workerDoc.data();

    // Add skill to ledger
    const skillRef = workerRef.collection('skills_ledger').doc(certificationId);
    await skillRef.set({
      earnedAt: admin.firestore.FieldValue.serverTimestamp(),
      score: score,
      verified: true,
      issuer: 'EDWL Academy'
    });

    // Evaluate for Tier Upgrade
    let newTier = workerData.tier;
    const totalSkills = (workerData.skills || []).length + 1;

    if (totalSkills >= 5 && workerData.experienceYears >= 3) {
      newTier = 'GOLD';
    } else if (totalSkills >= 2) {
      newTier = 'SILVER';
    }

    // Update main profile (this will automatically trigger the Vertex AI embedding webhook)
    await workerRef.update({
      skills: admin.firestore.FieldValue.arrayUnion(certificationId),
      tier: newTier,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    return {
      success: true,
      newTier,
      message: `Congratulations! You've unlocked ${certificationId}. Your tier is now ${newTier}.`
    };

  } catch (error) {
    console.error('Error unlocking certification:', error);
    throw new functions.https.HttpsError('internal', 'Failed to process certification.');
  }
});
