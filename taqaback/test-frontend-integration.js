const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testFrontendIntegration() {
    try {
        console.log('Testing frontend integration with file upload...');
        
        // Test 1: CSV file upload
        console.log('\n1. Testing CSV file upload...');
        const csvPath = path.join(__dirname, 'test/seedData/full-anomalies-data.csv');
        
        const formData1 = new FormData();
        formData1.append('csvFile', fs.createReadStream(csvPath));
        
        const csvResponse = await axios.post('http://localhost:3333/api/v1/anomalies/import/csv', formData1, {
            headers: {
                ...formData1.getHeaders()
            }
        });
        
        console.log('CSV Upload Response:', {
            status: csvResponse.status,
            message: csvResponse.data.message,
            fileId: csvResponse.data.fileId,
            fileType: csvResponse.data.fileType,
            size: csvResponse.data.size
        });
        
        // Test 2: Excel file upload
        console.log('\n2. Testing Excel file upload...');
        const excelPath = path.join(__dirname, 'Subject/Anonymized_data_extract_anomaliesimportantes.xlsx');
        
        const formData2 = new FormData();
        formData2.append('csvFile', fs.createReadStream(excelPath));
        
        const excelResponse = await axios.post('http://localhost:3333/api/v1/anomalies/import/csv', formData2, {
            headers: {
                ...formData2.getHeaders()
            }
        });
        
        console.log('Excel Upload Response:', {
            status: excelResponse.status,
            message: excelResponse.data.message,
            fileId: excelResponse.data.fileId,
            fileType: excelResponse.data.fileType,
            size: excelResponse.data.size
        });
        
        // Test 3: Invalid file type
        console.log('\n3. Testing invalid file type...');
        try {
            const invalidPath = path.join(__dirname, 'package.json');
            
            const formData3 = new FormData();
            formData3.append('csvFile', fs.createReadStream(invalidPath));
            
            await axios.post('http://localhost:3333/api/v1/anomalies/import/csv', formData3, {
                headers: {
                    ...formData3.getHeaders()
                }
            });
        } catch (error) {
            console.log('Invalid file type correctly rejected:', {
                status: error.response?.status,
                error: error.response?.data?.error
            });
        }
        
        console.log('\n✅ All tests completed successfully!');
        console.log('\nNext steps:');
        console.log('1. Update frontend file input to accept both .csv and .xlsx files');
        console.log('2. Update frontend service to use the correct endpoint');
        console.log('3. Test the complete user workflow');
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testFrontendIntegration();
