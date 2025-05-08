/**
 * Script to run the application with the appropriate environment
 * Usage: node scripts/run-env.js [environment]
 * 
 * Example:
 * node scripts/run-env.js development
 * node scripts/run-env.js production
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Get the environment from the command line
const environment = process.argv[2] || 'development';

// Path to the environment file
const envFilePath = path.join(__dirname, '..', `.env.${environment}`);
const envFile = fs.existsSync(envFilePath) ? envFilePath : null;

if (!envFile) {
  console.error(`Environment file for ${environment} not found.`);
  process.exit(1);
}

// Copy the environment file to .env
fs.copyFileSync(envFile, path.join(__dirname, '..', '.env'));

console.log(`Using ${environment} environment`);

// Run the application
const command = environment === 'development' 
  ? 'npx ts-node-dev --respawn --transpile-only src/server.ts'
  : 'node dist/server.js';

console.log(`Running: ${command}`);

// Execute the command
const [cmd, ...args] = command.split(' ');
const child = spawn(cmd, args, { stdio: 'inherit', shell: true });

child.on('close', (code) => {
  console.log(`Application process exited with code ${code}`);
}); 