const aiService = require('../services/aiService');

/**
 * Predict Employer Churn Risk
 */
exports.predictChurn = async (req, res) => {
    try {
        const { employerId } = req.params;
        const result = await aiService.predictEmployerChurn(employerId);
        res.status(200).json(result);
    } catch (error) {
        console.error('[PredictChurn Error]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get AI Match Insights
 */
exports.getMatchInsights = async (req, res) => {
    try {
        const { workerId, targetId, type } = req.query;
        const result = await aiService.calculatePrecisionMatch(workerId, targetId, type);
        res.status(200).json(result);
    } catch (error) {
        console.error('[MatchInsights Error]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/**
 * Get Market Trends & Predictive Pricing
 */
exports.getMarketTrends = async (req, res) => {
    try {
        const { role, city } = req.query;
        // In production, this queries aggregated hiring data
        const marketData = {
            role: role || 'GENERAL',
            city: city || 'Addis Ababa',
            averageSalary: role === 'NANNY' ? 5500 : 4200,
            demandScore: 0.85,
            suggestedPriceRange: {
                min: role === 'NANNY' ? 4500 : 3500,
                max: role === 'NANNY' ? 8000 : 6000
            },
            trend: 'UPWARD',
            activeSeekers: 142,
            openJobs: 89,
            lastUpdated: new Date()
        };
        res.status(200).json(marketData);
    } catch (error) {
        console.error('[MarketTrends Error]', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
