# AI Prediction Scripts

This directory contains scripts for testing and managing the AI prediction integration.

## Available Scripts

### Testing Scripts

1. **test-ai-prediction.ts**
   - Tests the AI prediction service in isolation
   - Run with: `npm run test:ai` or `npx ts-node scripts/test-ai-prediction.ts`

2. **test-ai-integration.ts**
   - Tests the full pipeline with AI integration
   - Run with: `npm run test:ai-integration` or `npx ts-node scripts/test-ai-integration.ts`

3. **test-with-mock-api.ts**
   - Tests the AI prediction service with a local mock API
   - Run with: `npm run test:ai-mock` or `npx ts-node scripts/test-with-mock-api.ts`

### Utility Scripts

1. **mock-ai-prediction-api.ts**
   - Starts a local mock API server for testing
   - Run with: `npx ts-node scripts/mock-ai-prediction-api.ts`

2. **clean-anomaly-pipeline.ts**
   - Cleans test data from the anomaly pipeline
   - Run with: `npx ts-node scripts/clean-anomaly-pipeline.ts`

## Configuration

You can override the AI prediction API endpoint using an environment variable:

```powershell
# Windows PowerShell
$env:AI_PREDICTION_API_URL = "http://localhost:3333/predict"

# Run tests
npm run test:ai
```

## Using the Mock API

When the external API is unavailable, you can use the mock API:

1. Start the mock API server:
   ```
   npx ts-node scripts/mock-ai-prediction-api.ts
   ```

2. Set the environment variable and run tests:
   ```powershell
   $env:AI_PREDICTION_API_URL = "http://localhost:3333/predict"
   npm run test:ai
   ```

Or use the all-in-one script:
   ```
   npm run test:ai-mock
   ```
