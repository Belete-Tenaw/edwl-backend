jest.mock('../utils/prisma', () => ({}));

jest.mock('../services/notificationService', () => ({
    notify: jest.fn()
}));

const { scoreJobForSeeker } = require('../services/matchingService');

describe('matchingService scoreJobForSeeker', () => {
    const baseJob = {
        title: 'Live-in childcare and cooking helper',
        description: 'Family needs childcare, cooking, cleaning, and Amharic communication.',
        requiredSkills: ['childcare', 'cooking', 'cleaning'],
        salaryOffered: 6500,
        jobType: 'Full-time domestic work',
        preferredArrangement: 'LIVE_IN',
        address: 'Bole, Addis Ababa',
        locationRegion: 'Addis Ababa',
        locationZone: 'Bole',
        locationWoreda: 'Woreda 03'
    };

    test('rewards a trusted candidate with matching skills, location, salary, and arrangement', () => {
        const seeker = {
            skills: ['childcare', 'cooking', 'cleaning'],
            languages: ['Amharic'],
            occupationCategory: 'HOUSEHOLD_SERVICES',
            customOccupation: null,
            bio: 'Experienced live-in domestic worker',
            experienceYears: 4,
            expectedSalary: 6000,
            preferredLocation: 'Bole',
            preferredArrangement: 'LIVE_IN',
            locationRegion: 'Addis Ababa',
            locationZone: 'Bole',
            locationWoreda: 'Woreda 03',
            verificationStatus: 'APPROVED',
            isVerified: true,
            isFaydaVerified: true,
            tier: 'GOLD',
            rating: 4.7,
            behaviorScore: 92,
            completedJobs: 3,
            responseTimeMs: 1800000
        };

        const result = scoreJobForSeeker(baseJob, seeker);

        expect(result.matchScore).toBeGreaterThanOrEqual(80);
        expect(result.matchInsights[0]).toMatch(/fit$/);
    });

    test('keeps a weak candidate below automatic notification threshold', () => {
        const seeker = {
            skills: ['driving'],
            languages: [],
            occupationCategory: 'TRANSPORTATION_SERVICES',
            customOccupation: null,
            bio: 'Driver',
            experienceYears: 1,
            expectedSalary: 12000,
            preferredLocation: 'Hawassa',
            preferredArrangement: 'LIVE_OUT',
            locationRegion: 'Sidama',
            locationZone: 'Hawassa',
            locationWoreda: 'Tabor',
            verificationStatus: 'NOT_STARTED',
            isVerified: false,
            isFaydaVerified: false,
            tier: 'BRONZE',
            rating: 0,
            behaviorScore: 40,
            completedJobs: 0
        };

        const result = scoreJobForSeeker(baseJob, seeker);

        expect(result.matchScore).toBeLessThan(50);
    });
});
