const axios = require('axios');

async function testAIService() {
    try {
        const testPayload = [
            {
                "anomaly_id": "test-123",
                "equipment_id": "EQ-001",
                "description": "Test anomaly for connection check",
                "equipment_name": "Test Equipment"
            }
        ];

        console.log('Testing AI service at: https://taqa-efuvl.ondigitalocean.app/predict');
        console.log('Payload:', JSON.stringify(testPayload, null, 2));

        const response = await axios.post(
            'https://taqa-efuvl.ondigitalocean.app/predict',
            testPayload,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000
            }
        );

        console.log('✅ AI service response:', JSON.stringify(response.data, null, 2));

    } catch (error) {
        console.error('❌ AI service test failed:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
    }
}

testAIService();
