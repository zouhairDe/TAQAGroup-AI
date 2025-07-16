const FormData = require('form-data');
const fs = require('fs');

async function testFileUpload() {
  console.log('Testing file upload to anomalies import endpoint...');
  
  const form = new FormData();
  const csvFile = fs.createReadStream('frontend-test-anomalies.csv');
  
  form.append('csvFile', csvFile, {
    filename: 'frontend-test-anomalies.csv',
    contentType: 'text/csv'
  });
  
  try {
    const response = await fetch('http://localhost:3333/api/v1/anomalies/import/csv', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const result = await response.json();
    console.log('Upload result:', result);
    
    if (response.ok) {
      console.log('✅ CSV file upload successful!');
      console.log('File ID:', result.fileId);
      console.log('Filename:', result.filename);
      console.log('File Type:', result.fileType);
      console.log('Size:', result.size, 'bytes');
    } else {
      console.error('❌ Upload failed:', result);
    }
  } catch (error) {
    console.error('❌ Error during upload:', error.message);
  }
}

// Test Excel upload
async function testExcelUpload() {
  console.log('\nTesting Excel file upload...');
  
  const form = new FormData();
  const excelFile = fs.createReadStream('frontend-test-anomalies.xlsx');
  
  form.append('csvFile', excelFile, {
    filename: 'frontend-test-anomalies.xlsx',
    contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  
  try {
    const response = await fetch('http://localhost:3333/api/v1/anomalies/import/csv', {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });
    
    const result = await response.json();
    console.log('Excel upload result:', result);
    
    if (response.ok) {
      console.log('✅ Excel file upload successful!');
      console.log('File ID:', result.fileId);
      console.log('Filename:', result.filename);
      console.log('File Type:', result.fileType);
      console.log('Size:', result.size, 'bytes');
    } else {
      console.error('❌ Excel upload failed:', result);
    }
  } catch (error) {
    console.error('❌ Error during Excel upload:', error.message);
  }
}

// Run tests
testFileUpload().then(() => testExcelUpload());
