const cron = require('node-cron');
const prisma = require('../utils/prisma');

// Mock Email Sender (Replace with your actual SendGrid/Mailgun implementation)
const sendEmail = async ({ to, subject, html }) => {
    console.log(`[Email Mock] Sent to: ${to} | Subject: ${subject}`);
};

/**
 * Phase 3: Predictive Analytics & Churn Prevention
 * This algorithm runs daily. It analyzes employer usage and targets
 * those who haven't logged in (or posted a job/viewed a profile) for 3 weeks.
 * It queries the new "Smart Search" engine (or DB) for Gold Tier candidates
 * in their specific area to re-engage them.
 */

async function runChurnPreventionAlg() {
  console.log('[PredictiveRetention] Running Employer Churn Prevention Analysis...');
  
  const THREE_WEEKS_AGO = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000);

  try {
    // Find employers who haven't had recent view logs or job posts in the last 3 weeks
    // In a real scenario, you'd track lastLoginAt. We use 'updatedAt' or 'viewLogs' as proxy here.
    const atRiskEmployers = await prisma.employer.findMany({
      where: {
        isActive: true,
        // Assuming we check their last activity. For now, we use a custom query:
        // We look for those with no recent ViewLogs
        viewLogs: {
          none: {
            createdAt: {
              gte: THREE_WEEKS_AGO
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        phone: true,
        contactName: true,
        locationRegion: true,
        locationZone: true
      }
    });

    if (atRiskEmployers.length === 0) {
      console.log('[PredictiveRetention] No at-risk employers found today.');
      return;
    }

    console.log(`[PredictiveRetention] Found ${atRiskEmployers.length} at-risk employers. Generating re-engagement content...`);

    for (const employer of atRiskEmployers) {
      // Find high-quality workers (Gold/Platinum Tier) near them
      const topWorkers = await prisma.jobSeeker.findMany({
        where: {
          isActive: true,
          isVerified: true,
          tier: { in: ['GOLD', 'PLATINUM'] },
          locationRegion: employer.locationRegion // Proximity matching
        },
        orderBy: { rating: 'desc' },
        take: 3,
        select: {
          fullName: true,
          skills: true,
          experienceYears: true,
          badge: true
        }
      });

      if (topWorkers.length > 0) {
        // Construct hyper-personalized re-engagement message
        let workerListHtml = topWorkers.map(w => `<li><b>${w.fullName}</b> (${w.badge}) - ${w.experienceYears} yrs exp. Skills: ${w.skills.join(', ')}</li>`).join('');
        
        const htmlMessage = `
          <h2>Hello ${employer.contactName}, we've missed you!</h2>
          <p>We noticed you haven't been active on EDWL recently. We wanted to let you know that several top-rated, highly vetted domestic professionals have just joined in your area (${employer.locationRegion || 'your city'}).</p>
          <ul>${workerListHtml}</ul>
          <p>Login today to review these exclusive profiles before they are hired!</p>
          <a href="https://edwl-ethio-domesticworkerslink.web.app/dashboard">Return to Dashboard</a>
        `;

        if (employer.email) {
          await sendEmail({
            to: employer.email,
            subject: '⭐ New Gold-Tier Professionals in Your Neighborhood',
            html: htmlMessage
          });
          console.log(`[PredictiveRetention] Sent retention email to ${employer.email}`);
        }
        
        // IF SMS Gateway (like Ethio Telecom or Twilio) is configured:
        // if (employer.phone) {
        //   await sendSMS(employer.phone, `Hi ${employer.contactName}, new Gold-Tier domestic workers are available in your area on EDWL. Log in to hire them securely today!`);
        // }
      }
    }
  } catch (error) {
    console.error('[PredictiveRetention] Error during execution:', error);
  }
}

module.exports = { runChurnPreventionAlg };
