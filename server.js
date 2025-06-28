const { Server } = require('ssh2');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');
const crypto = require('crypto');

// SSH Server configuration
const SSH_PORT = process.env.PORT || 2222;

// Auto-generate host key if it doesn't exist
function ensureHostKey() {
  const keysDir = path.join(__dirname, 'keys');
  const keyPath = path.join(keysDir, 'host_key');
  
  try {
    if (fs.existsSync(keyPath)) {
      console.log(chalk.green('✅ Host key found'));
      return fs.readFileSync(keyPath);
    }
    
    console.log(chalk.yellow('🔑 Generating host key...'));
    
    // Create keys directory if it doesn't exist
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { recursive: true });
    }
    
    // Generate RSA key pair
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      }
    });
    
    // Save keys
    fs.writeFileSync(keyPath, privateKey);
    fs.writeFileSync(keyPath + '.pub', publicKey);
    
    console.log(chalk.green('✅ Host key generated successfully'));
    return privateKey;
    
  } catch (error) {
    console.error(chalk.red('❌ Failed to generate host key:', error.message));
    process.exit(1);
  }
}

// Get the host key
const HOST_KEY = ensureHostKey();

// Global error handlers to prevent crashes
process.on('uncaughtException', (error) => {
  console.error(chalk.red('💥 Uncaught Exception:', error));
  // Don't exit, just log it
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(chalk.red('💥 Unhandled Rejection at:', promise, 'reason:', reason));
  // Don't exit, just log it
});

// Create SSH Server with better error handling
const server = new Server({
  hostKeys: [HOST_KEY]
}, (client) => {
  console.log(chalk.green('Client connected!'));

  // Add client error handling
  client.on('error', (err) => {
    console.log(chalk.red('Client error:', err.message));
    // Don't crash, just log and continue
  });

  client.on('authentication', (ctx) => {
    try {
      // For demo purposes, accept any username/password
      // In production, you'd want proper authentication
      if (ctx.method === 'password') {
        console.log(chalk.blue(`Login attempt: ${ctx.username}`));
        ctx.accept();
      } else {
        ctx.reject();
      }
    } catch (error) {
      console.error(chalk.red('Auth error:', error.message));
      ctx.reject();
    }
  });

  client.on('ready', () => {
    console.log(chalk.green('Client authenticated!'));

    client.on('session', (accept, reject) => {
      try {
        const session = accept();

        session.once('shell', (accept, reject) => {
          try {
            const stream = accept();
            
            // Send welcome message with error handling
            try {
              const welcomeMessage = generateWelcomeMessage();
              stream.write(welcomeMessage + '\r\n');
              stream.write('$ ');
            } catch (error) {
              console.error(chalk.red('Welcome message error:', error.message));
              stream.write('Welcome to SSH Terminal!\r\n$ ');
            }

            let inputBuffer = '';

            // Handle data from SSH client with error handling
            stream.on('data', (data) => {
              try {
                const input = data.toString();
                
                for (let i = 0; i < input.length; i++) {
                  const char = input[i];
                  const code = input.charCodeAt(i);
                  
                  if (code === 13) { // Enter key
                    stream.write('\r\n');
                    processCommand(stream, inputBuffer.trim());
                    inputBuffer = '';
                    stream.write('$ ');
                  } else if (code === 127 || code === 8) { // Backspace
                    if (inputBuffer.length > 0) {
                      inputBuffer = inputBuffer.slice(0, -1);
                      stream.write('\b \b');
                    }
                  } else if (code >= 32 && code <= 126) { // Printable characters
                    inputBuffer += char;
                    stream.write(char);
                  }
                }
              } catch (error) {
                console.error(chalk.red('Data handling error:', error.message));
              }
            });

            stream.on('error', (err) => {
              console.log(chalk.red('Stream error:', err.message));
            });

            stream.on('close', () => {
              console.log(chalk.yellow('Session closed'));
            });
          } catch (error) {
            console.error(chalk.red('Shell setup error:', error.message));
            reject();
          }
        });
      } catch (error) {
        console.error(chalk.red('Session setup error:', error.message));
        reject();
      }
    });
  });

  client.on('end', () => {
    console.log(chalk.yellow('Client disconnected'));
  });

  client.on('error', (err) => {
    console.log(chalk.red('Client error:', err.message));
  });
});

function generateWelcomeMessage() {
  try {
    const banner = figlet.textSync('Terminal Shop', {
      font: 'Small',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });

    return `
${chalk.cyan(banner)}

${chalk.green('=')}${chalk.green('='.repeat(60))}${chalk.green('=')}
${chalk.yellow('  Welcome to Marcos\' Terminal Shop!')}
${chalk.yellow('  A custom SSH terminal experience')}
${chalk.green('=')}${chalk.green('='.repeat(60))}${chalk.green('=')}

${chalk.white('Available commands:')}
${chalk.cyan('  help')}     - Show available commands
${chalk.cyan('  about')}    - About this terminal
${chalk.cyan('  time')}     - Show current time
${chalk.cyan('  date')}     - Show full date
${chalk.cyan('  whoami')}   - Show user info
${chalk.cyan('  uptime')}   - Show server uptime
${chalk.cyan('  clear')}    - Clear the screen
${chalk.cyan('  exit')}     - Exit the terminal

${chalk.magenta('Type a command and press Enter:')}
`;
  } catch (error) {
    console.error(chalk.red('Figlet error:', error.message));
    return `
=============================================================
  Welcome to Marcos' Terminal Shop!
  A custom SSH terminal experience
=============================================================

Available commands:
  help     - Show available commands
  about    - About this terminal
  time     - Show current time
  date     - Show full date
  whoami   - Show user info
  uptime   - Show server uptime
  clear    - Clear the screen
  exit     - Exit the terminal

Type a command and press Enter:
`;
  }
}

function generateHelpMessage() {
  return `
${chalk.yellow('Available Commands:')}
${chalk.cyan('─'.repeat(40))}
${chalk.green('help')}      - Show this help message
${chalk.green('about')}     - Information about this terminal
${chalk.green('time')}      - Display current date and time
${chalk.green('date')}      - Display full date and time
${chalk.green('whoami')}    - Display current user info
${chalk.green('uptime')}    - Show server uptime
${chalk.green('clear')}     - Clear the terminal screen
${chalk.green('exit')}      - Exit the terminal session

${chalk.yellow('Tips:')}
- This is a custom SSH terminal server
- Built with Node.js and SSH2
- Similar to Primegen's terminal.shop
`;
}

function generateAboutMessage() {
  return `
${chalk.yellow('About Terminal Shop')}
${chalk.cyan('─'.repeat(30))}
${chalk.white('This is a custom SSH terminal server built with Node.js')}
${chalk.white('Inspired by Primegen\'s terminal.shop')}

${chalk.green('Features:')}
- Custom SSH server
- Interactive terminal interface
- Cross-platform support
- Extensible command system

${chalk.blue('Built by:')} Marcos
${chalk.blue('Version:')} 1.0.0
`;
}

function processCommand(stream, input) {
  try {
    if (input === 'exit' || input === 'quit') {
      stream.write('Goodbye! Thanks for visiting the terminal!\r\n');
      stream.end();
      return;
    }

    if (input === 'help') {
      stream.write(generateHelpMessage() + '\r\n');
      return;
    }

    if (input === 'about') {
      stream.write(generateAboutMessage() + '\r\n');
      return;
    }

    if (input === 'time') {
    stream.write(`Current time: ${new Date().toLocaleString()}\r\n`);
    return;
  }

  if (input === 'clear') {
    stream.write('\x1B[2J\x1B[H');
    stream.write(generateWelcomeMessage() + '\r\n');
    return;
  }

  if (input === 'whoami') {
    stream.write('You are connected to Marcos\' Terminal Shop!\r\n');
    return;
  }

  if (input === 'uptime') {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    stream.write(`Server uptime: ${hours}h ${minutes}m ${seconds}s\r\n`);
    return;
  }

  if (input === 'date') {
    stream.write(`${new Date().toString()}\r\n`);
    return;
  }

  if (input === '') {
    return; // Just show new prompt
  }

  // Unknown command
  stream.write(`Command not found: ${input}\r\n`);
  stream.write('Type "help" for available commands.\r\n');
  } catch (error) {
    console.error(chalk.red('Command processing error:', error.message));
    stream.write(`Error processing command: ${input}\r\n`);
    stream.write('Type "help" for available commands.\r\n');
  }
}

// Start the server with better error handling
server.listen(SSH_PORT, '0.0.0.0', (err) => {
  if (err) {
    console.error(chalk.red('❌ Failed to start server:', err.message));
    process.exit(1);
  }
  console.log(chalk.green(`🚀 SSH Terminal Server listening on port ${SSH_PORT}`));
  console.log(chalk.yellow(`📡 Connect with: ssh -p ${SSH_PORT} user@your-server-ip`));
  console.log(chalk.blue('🔑 Use any username/password for demo purposes'));
  console.log(chalk.magenta(`🌐 Railway URL: https://your-app.up.railway.app`));
});

server.on('error', (err) => {
  console.error(chalk.red('💥 Server error:', err.message));
  if (err.code === 'EADDRINUSE') {
    console.error(chalk.red(`Port ${SSH_PORT} is already in use!`));
  } else if (err.code === 'EACCES') {
    console.error(chalk.red(`Permission denied to bind to port ${SSH_PORT}`));
  }
  // Don't crash on server errors in production
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Shutting down SSH server...'));
  server.close(() => {
    console.log(chalk.green('✅ Server closed'));
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log(chalk.yellow('\n🛑 Received SIGTERM, shutting down...'));
  server.close(() => {
    console.log(chalk.green('✅ Server closed'));
    process.exit(0);
  });
});
