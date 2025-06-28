#!/usr/bin/env node

// Health check script for Railway deployment
const { spawn } = require('child_process');
const chalk = require('chalk');

console.log(chalk.cyan('🔍 Checking SSH server health...'));

// Check if the server process is running
const netstat = spawn('netstat', ['-tuln'], { shell: true });

let output = '';

netstat.stdout.on('data', (data) => {
  output += data.toString();
});

netstat.on('close', (code) => {
  const port = process.env.PORT || 2222;
  
  if (output.includes(`:${port} `)) {
    console.log(chalk.green(`✅ SSH server is listening on port ${port}`));
    process.exit(0);
  } else {
    console.log(chalk.red(`❌ SSH server not found on port ${port}`));
    console.log(chalk.yellow('Active ports:'));
    console.log(output);
    process.exit(1);
  }
});

netstat.on('error', (err) => {
  console.log(chalk.yellow('⚠️  Could not check netstat, trying alternative...'));
  
  // Alternative check - try to connect to the port
  const net = require('net');
  const client = new net.Socket();
  const port = process.env.PORT || 2222;
  
  client.connect(port, 'localhost', () => {
    console.log(chalk.green(`✅ SSH server is responding on port ${port}`));
    client.destroy();
    process.exit(0);
  });
  
  client.on('error', (err) => {
    console.log(chalk.red(`❌ Cannot connect to SSH server on port ${port}`));
    console.log(chalk.red(`Error: ${err.message}`));
    process.exit(1);
  });
  
  // Timeout after 5 seconds
  setTimeout(() => {
    console.log(chalk.red(`❌ Connection timeout - SSH server may not be running`));
    client.destroy();
    process.exit(1);
  }, 5000);
});
