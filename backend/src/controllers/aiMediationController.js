const aiService = require('../services/aiService');

/**
 * Automate Mediation for an Escrow Dispute
 */
exports.autoMediateDispute = async (req, res) => {
    try {
        const { disputeId } = req.body;

        if (!disputeId) {
            return res.status(400).json({ error: 'Dispute ID is required' });
        }

        // Call the AI Service to process mediation
        const result = await aiService.mediateConflict(disputeId);

        if (result.error) {
            return res.status(result.error === 'Dispute not found' ? 404 : 500).json({ error: result.error });
        }

        res.status(200).json({
            message: 'AI Mediation analysis complete',
            ...result
        });

    } catch (error) {
        console.error('Error in AI Mediation Controller:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
