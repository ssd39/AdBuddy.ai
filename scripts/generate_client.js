#!/usr/bin/env node

/**
 * API Client Generator Script
 * 
 * This script generates TypeScript API clients based on OpenAPI/Swagger specs from the FastAPI backend.
 * It uses openapi-typescript-codegen to generate the client code.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BACKEND_URL = 'http://localhost:8000';
const OPENAPI_PATH = '/api/v1/openapi.json';
const OUTPUT_DIR = path.join(__dirname, '../frontend/src/services/api');

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Generating API client from OpenAPI spec...');
console.log(`Backend URL: ${BACKEND_URL}`);
console.log(`Output directory: ${OUTPUT_DIR}`);

try {
  // Install openapi-typescript-codegen if not already installed
  console.log('Ensuring openapi-typescript-codegen is installed...');
  try {
    execSync('npm list -g openapi-typescript-codegen', { stdio: 'ignore' });
  } catch (error) {
    console.log('Installing openapi-typescript-codegen...');
    execSync('npm install -g openapi-typescript-codegen');
  }

  // Generate the API client
  console.log('Generating API client...');
  execSync(
    `openapi --input ${BACKEND_URL}${OPENAPI_PATH} --output ${OUTPUT_DIR} --client axios --useOptions --exportCore true --exportServices true --exportModels true`,
    { stdio: 'inherit' }
  );

  console.log('\nAPI client generation completed successfully!');
  console.log(`Client code has been generated in: ${OUTPUT_DIR}`);
} catch (error) {
  console.error('\nError generating API client:');
  console.error(error.message);
  console.error('\nPossible causes:');
  console.error('1. The backend server is not running');
  console.error('2. The OpenAPI spec URL is incorrect');
  console.error('3. There was an error in the OpenAPI spec');
  console.error('\nMake sure the backend server is running and try again.');
  process.exit(1);
}