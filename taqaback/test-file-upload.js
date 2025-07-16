const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const axios = require('axios');

async function testFileUpload() {
    try {
        // Create a simple test CSV file
        const testCsvContent = `id,title,description,severity,status,equipment_id,section_id,site_id,created_at
1,Test Anomaly,This is a test anomaly,HIGH,OPEN,1,1,1,2025-01-01T00:00:00.000Z
2,Another Test,Another test anomaly,MEDIUM,IN_PROGRESS,2,2,1,2025-01-02T00:00:00.000Z`;
        
        const testFilePath = path.join(__dirname, 'test-upload.csv');
        fs.writeFileSync(testFilePath, testCsvContent);
          // Create FormData
        const formData = new FormData();
        formData.append('csvFile', fs.createReadStream(testFilePath));
          // Test the upload
        const response = await axios.post('http://localhost:3333/api/v1/anomalies/import/csv', formData, {
            headers: {
                ...formData.getHeaders(),
                'Content-Type': 'multipart/form-data'
            }
        });
        
        console.log('Upload successful:', response.data);
        
        // Clean up
        fs.unlinkSync(testFilePath);
        
    } catch (error) {
        console.error('Upload failed:', error.response?.data || error.message);
    }
}

testFileUpload();
