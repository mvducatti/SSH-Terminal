#!/usr/bin/env node

// Railway startup script with enhanced logging and error handling
const chalk = require('chalk');

console.log(chalk.cyan('🚀 Starting SSH Terminal Server for Railway...'));
console.log(chalk.yellow(`📊 Environment: ${process.env.NODE_ENV || 'development'}`));
console.log(chalk.yellow(`🔌 Port: ${process.env.PORT || 2222}`));
console.log(chalk.yellow(`💾 Node version: ${process.version}`));
console.log(chalk.yellow(`🖥️  Platform: ${process.platform}`));

// Check for required files
const fs = require('fs');
const path = require('path');

const requiredFiles = [
  'keys/host_key',
  'keys/host_key.pub'
];

let missingFiles = [];

for (const file of requiredFiles) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
}

if (missingFiles.length > 0) {
  console.log(chalk.red('❌ Missing required files:'));
  missingFiles.forEach(file => console.log(chalk.red(`   - ${file}`)));
  console.log(chalk.yellow('🔧 Generating missing keys...'));
  
  // Try to generate keys
  try {
    require('./generate-keys.js');
    console.log(chalk.green('✅ Keys generated successfully'));
  } catch (error) {
    console.log(chalk.red('❌ Failed to generate keys:', error.message));
    process.exit(1);
  }
} else {
  console.log(chalk.green('✅ All required files present'));
}

// Start the main server
console.log(chalk.cyan('🎬 Starting main server...'));
require('./server.js');
