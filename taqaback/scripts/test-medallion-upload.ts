import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const API_BASE_URL = 'http://localhost:3000/api';

async function testMedallionUpload() {
  try {
    console.log('🧪 Testing Medallion Architecture Upload...\n');

    // Test file path - using existing test data
    const testFilePath = path.join(process.cwd(), 'test', 'seedData', 'full-anomalies-data.csv');
    
    if (!fs.existsSync(testFilePath)) {
      console.error(`❌ Test file not found: ${testFilePath}`);
      return;
    }

    console.log(`📁 Using test file: ${testFilePath}`);
    
    // Create form data
    const formData = new FormData();
    formData.append('csvFile', fs.createReadStream(testFilePath));

    // Upload file using medallion architecture
    console.log('🚀 Starting medallion upload...');
    
    const response = await axios.post(`${API_BASE_URL}/anomalies/import/csv`, formData, {
      headers: {
        ...formData.getHeaders()
      },
      timeout: 60000 // 60 second timeout
    });

    console.log('✅ Upload response:', response.data);

    if (response.data.pipeline === 'medallion') {
      console.log('\n🎯 Medallion pipeline started successfully!');
      console.log(`📋 File ID: ${response.data.fileId}`);
      console.log(`📄 Filename: ${response.data.filename}`);
      console.log(`📊 Size: ${response.data.size} bytes`);

      // Wait a bit for processing to start
      console.log('\n⏳ Waiting for processing to complete...');
      
      // Check processing status periodically
      let attempts = 0;
      const maxAttempts = 30; // 5 minutes max wait time
      
      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
        attempts++;
        
        try {
          // Check if anomalies were created
          const anomaliesResponse = await axios.get(`${API_BASE_URL}/anomalies?limit=10&page=1`);
          const anomalies = anomaliesResponse.data;
          
          console.log(`📈 Attempt ${attempts}: Found ${anomalies.total || 0} anomalies in system`);
          
          if (anomalies.total && anomalies.total > 0) {
            console.log('\n🎉 SUCCESS! Anomalies have been processed and saved to Gold layer!');
            
            // Show sample anomaly
            if (anomalies.data && anomalies.data.length > 0) {
              const sampleAnomaly = anomalies.data[0];
              console.log('\n📋 Sample anomaly:');
              console.log(`   ID: ${sampleAnomaly.id}`);
              console.log(`   Code: ${sampleAnomaly.code}`);
              console.log(`   Title: ${sampleAnomaly.title}`);
              console.log(`   Criticité: ${sampleAnomaly.criticite}`);
              console.log(`   Disponibilité: ${sampleAnomaly.disponibilite}`);
              console.log(`   Fiabilité: ${sampleAnomaly.fiabilite}`);
              console.log(`   Process Safety: ${sampleAnomaly.processSafety}`);
              console.log(`   AI Confidence: ${sampleAnomaly.aiConfidence}`);
              console.log(`   Status: ${sampleAnomaly.status}`);
              console.log(`   Priority: ${sampleAnomaly.priority}`);
            }
            
            break;
          }
          
        } catch (checkError) {
          console.log(`⚠️  Attempt ${attempts}: Could not check anomalies status`);
        }
      }
      
      if (attempts >= maxAttempts) {
        console.log('\n⏰ Timeout reached. Processing may still be ongoing in the background.');
      }

    } else {
      console.log('❌ Expected medallion pipeline but got:', response.data.pipeline);
    }

  } catch (error) {
    console.error('❌ Error testing medallion upload:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testMedallionUpload().catch(console.error); 