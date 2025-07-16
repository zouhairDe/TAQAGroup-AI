#!/usr/bin/env node

/**
 * TAQA Dashboard Integration Setup Script
 * 
 * This script helps set up the environment for the TAQA dashboard backend integration.
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 TAQA Dashboard Integration Setup');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('✅ .env.local file already exists');
  
  // Read and check the content
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('NEXT_PUBLIC_API_URL')) {
    console.log('✅ API URL is already configured');
  } else {
    console.log('⚠️  API URL not found in .env.local');
    console.log('Please add: NEXT_PUBLIC_API_URL=http://localhost:3000');
  }
} else {
  console.log('📝 Creating .env.local file...');
  
  const envContent = `# TAQA Frontend Environment Configuration
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Development Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=TAQA Anomaly Management
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully');
}

console.log('\n📋 Setup Instructions:');
console.log('=====================');
console.log('1. Ensure the backend is running:');
console.log('   cd taqa-backend');
console.log('   npm run dev');
console.log('');
console.log('2. Seed the database:');
console.log('   npm run db:seed');
console.log('');
console.log('3. Start the frontend:');
console.log('   cd taqafront');
console.log('   npm run dev');
console.log('');
console.log('4. Open your browser to: http://localhost:3001');
console.log('');
console.log('🔧 Troubleshooting:');
console.log('==================');
console.log('- If you see CORS errors, ensure the backend is running on port 3000');
console.log('- If no data appears, check that the database is seeded');
console.log('- Check browser console for any API errors');
console.log('');
console.log('📚 For more information, see: INTEGRATION_README.md');
console.log('');
console.log('🎉 Setup complete! Happy coding!'); 