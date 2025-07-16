const axios = require('axios');

async function testDirectAIIntegration() {
    try {
        // Use real Silver layer data
        const testData = [
            {
                "anomaly_id": "cmcw0cwdv0008paku3ogu075e",
                "equipment_id": "EQ-001-TURB-01", 
                "description": "Vibration excessive détectée sur palier principal",
                "equipment_name": "Turbine à vapeur principale unité 1"
            },
            {
                "anomaly_id": "cmcw0cwvh0009pakur90sz6a7",
                "equipment_id": "EQ-002-COMP-01",
                "description": "Fuite détectée au niveau du joint d'étanchéité", 
                "equipment_name": "Compresseur centrifuge circuit principal"
            }
        ];

        console.log('🧪 Testing AI service with real Silver layer data...\n');
        console.log('Payload:');
        console.log(JSON.stringify(testData, null, 2));

        const response = await axios.post(
            'https://taqa-efuvl.ondigitalocean.app/predict',
            testData,
            {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 30000
            }
        );

        console.log('\n✅ AI service response:');
        console.log('Status:', response.data.status);
        console.log('Batch info:', response.data.batch_info);
        
        response.data.results.forEach((result, index) => {
            console.log(`\nResult ${index + 1}:`);
            console.log(`  Anomaly ID: ${result.anomaly_id}`);
            console.log(`  Equipment ID: ${result.equipment_id}`);
            console.log(`  Status: ${result.status}`);
            console.log(`  Reliability: ${result.predictions?.reliability?.score}`);
            console.log(`  Availability: ${result.predictions?.availability?.score}`);
            console.log(`  Process Safety: ${result.predictions?.process_safety?.score}`);
            console.log(`  Overall Score: ${result.overall_score}`);
            console.log(`  Risk Level: ${result.risk_assessment?.overall_risk_level}`);
            
            // Calculate criticality as backend does
            const fiabilite = result.predictions?.reliability?.score || 0;
            const disponibilite = result.predictions?.availability?.score || 0;
            const processSafety = result.predictions?.process_safety?.score || 0;
            const criticite = fiabilite + disponibilite + processSafety;
            
            let criticityLevel = 'Low';
            if (criticite >= 11) {
                criticityLevel = 'Critical';
            } else if (criticite >= 8) {
                criticityLevel = 'High';
            } else if (criticite >= 4) {
                criticityLevel = 'Medium';
            }
            
            console.log(`  Calculated Criticité: ${criticite} (${criticityLevel})`);
        });

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
    }
}

testDirectAIIntegration();
