/**
 * Test script with local mock API
 * 
 * This script runs the AI prediction test with a local mock API.
 * It starts the mock API server and then runs the test.
 * 
 * Run with: npx ts-node scripts/test-with-mock-api.ts
 */

import { spawn } from 'child_process';
import { join } from 'path';

async function startMockApi(): Promise<any> {
  return new Promise((resolve, reject) => {
    console.log('Starting mock AI prediction API server...');
    
    const mockApiProcess = spawn('npx', ['ts-node', 'scripts/mock-ai-prediction-api.ts'], {
      stdio: 'pipe',
      env: { ...process.env },
      shell: true
    });
    
    mockApiProcess.stdout.on('data', (data) => {
      console.log(`[Mock API] ${data.toString().trim()}`);
      
      // When we see this message, the server is ready
      if (data.toString().includes('Mock AI prediction API running')) {
        setTimeout(() => resolve(mockApiProcess), 1000); // Give it a bit more time to fully start
      }
    });
    
    mockApiProcess.stderr.on('data', (data) => {
      console.error(`[Mock API Error] ${data.toString().trim()}`);
    });
    
    mockApiProcess.on('error', (error) => {
      console.error('Failed to start mock API:', error);
      reject(error);
    });
      // If it doesn't start within 10 seconds, assume it failed
    setTimeout(() => {
      reject(new Error('Mock API server failed to start within timeout period'));
    }, 10000);
  });
}

async function runTest() {
  console.log('Starting test with mock API...');
  
  let mockApiProcess: any = null;
  
  try {
    // Start the mock API
    mockApiProcess = await startMockApi();
    
    console.log('Mock API server started successfully');
    
    // Set environment variable to use the mock API
    process.env.AI_PREDICTION_API_URL = 'http://localhost:3333/predict';
    
    console.log('\nRunning AI prediction test with mock API...');
    console.log('----------------------------------------------');
    
    // Run the test script as a separate process
    const testProcess = spawn('npx', ['ts-node', 'scripts/test-ai-prediction.ts'], {
      stdio: 'inherit',
      env: { ...process.env },
      shell: true
    });
    
    await new Promise<void>((resolve, reject) => {
      testProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('\nTest completed successfully');
          resolve();
        } else {
          reject(new Error(`Test failed with exit code ${code}`));
        }
      });
      
      testProcess.on('error', (error) => {
        reject(error);
      });
    });
    
  } catch (error) {
    console.error('Error during test:', error instanceof Error ? error.message : 'Unknown error');
  } finally {
    // Clean up - kill the mock API process
    if (mockApiProcess) {
      console.log('Shutting down mock API server...');
      mockApiProcess.kill();
    }
  }
}

// Run the test
if (require.main === module) {
  runTest()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}
