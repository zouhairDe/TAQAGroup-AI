const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function testMedallionCsvUpload() {
    try {
        // Use the existing full-anomalies-data.csv file
        const csvFilePath = path.join(__dirname, 'test', 'seedData', 'full-anomalies-data.csv');
        
        if (!fs.existsSync(csvFilePath)) {
            console.error('CSV file not found:', csvFilePath);
            return;
        }
        
        console.log('Testing medallion CSV upload with file:', csvFilePath);
        
        // Create FormData
        const form = new FormData();
        const csvFile = fs.createReadStream(csvFilePath);
        
        form.append('file', csvFile, {
            filename: 'full-anomalies-data.csv',
            contentType: 'text/csv'
        });
        
        // Test the upload to medallion endpoint
        const response = await fetch('http://localhost:3333/api/v1/medallion/import/csv', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });
        
        const result = await response.json();
        console.log('Medallion CSV upload result:', JSON.stringify(result, null, 2));
        
        if (response.ok && result.success) {
            console.log('✅ Medallion CSV upload successful!');
            
            // If successful, try to run the bronze to silver processing
            console.log('\nTesting Bronze to Silver processing...');
            const bronzeToSilverResponse = await fetch('http://localhost:3333/api/v1/medallion/process/bronze-to-silver', {
                method: 'POST'
            });
            const bronzeToSilverResult = await bronzeToSilverResponse.json();
            console.log('Bronze to Silver processing:', JSON.stringify(bronzeToSilverResult, null, 2));
            
            if (bronzeToSilverResponse.ok && bronzeToSilverResult.success) {
                console.log('✅ Bronze to Silver processing successful!');
                
                // If successful, try to run the silver to gold processing
                console.log('\nTesting Silver to Gold processing...');
                const silverToGoldResponse = await fetch('http://localhost:3333/api/v1/medallion/process/silver-to-gold', {
                    method: 'POST'
                });
                const silverToGoldResult = await silverToGoldResponse.json();
                console.log('Silver to Gold processing:', JSON.stringify(silverToGoldResult, null, 2));
                
                if (silverToGoldResponse.ok && silverToGoldResult.success) {
                    console.log('✅ Silver to Gold processing successful!');
                    console.log('🎉 Complete medallion pipeline test completed successfully!');
                } else {
                    console.error('❌ Silver to Gold processing failed');
                }
            } else {
                console.error('❌ Bronze to Silver processing failed');
            }
        } else {
            console.error('❌ Medallion CSV upload failed');
        }
        
    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testMedallionCsvUpload();
