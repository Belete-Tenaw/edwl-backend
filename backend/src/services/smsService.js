/**
 * Mock SMS Dispatcher Service
 * Integrates with SMS gateways like AfroMessage in production.
 * For development, it logs the SMS content to the console.
 */

exports.sendSMS = async (phoneNumber, message) => {
    // Basic validation
    if (!phoneNumber || !message) {
        throw new Error("Phone number and message are required.");
    }

    // Simulate network delay to SMS Gateway
    await new Promise(resolve => setTimeout(resolve, 500));

    // Simulate AfroMessage or similar provider API integration
    // In production, you would use axios here. Example:
    /*
    const response = await axios.post('https://api.afromessage.com/api/send', {
        to: phoneNumber,
        message: message
    }, {
        headers: { 'Authorization': `Bearer ${process.env.AFROMESSAGE_API_KEY}` }
    });
    */

    console.log(`\n[SMS MOCK] 📱 Sending message to ${phoneNumber}`);
    console.log(`[SMS MOCK] ✉️  Content: "${message}"`);
    console.log(`[SMS MOCK] ✅ Status: Successfully "delivered" (Mock)\n`);

    return {
        success: true,
        message: "SMS dispatched successfully",
        gatewayId: "MOCK-" + Math.random().toString(36).substring(7)
    };
};
