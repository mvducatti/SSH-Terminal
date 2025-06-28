const { Server } = require('ssh2');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const figlet = require('figlet');

// SSH Server configuration
const SSH_PORT = process.env.PORT || 2222;
const HOST_KEY = fs.readFileSync(path.join(__dirname, 'keys', 'host_key'));

// Create SSH Server
const server = new Server({
  hostKeys: [HOST_KEY]
}, (client) => {
  console.log(chalk.green('Client connected!'));

  client.on('authentication', (ctx) => {
    // For demo purposes, accept any username/password
    // In production, you'd want proper authentication
    if (ctx.method === 'password') {
      console.log(chalk.blue(`Login attempt: ${ctx.username}`));
      ctx.accept();
    } else {
      ctx.reject();
    }
  });

  client.on('ready', () => {
    console.log(chalk.green('Client authenticated!'));

    client.on('session', (accept, reject) => {
      const session = accept();

      session.once('shell', (accept, reject) => {
        const stream = accept();
        
        // Send welcome message
        const welcomeMessage = generateWelcomeMessage();
        stream.write(welcomeMessage + '\r\n');
        stream.write('$ ');

        let inputBuffer = '';

        // Handle data from SSH client
        stream.on('data', (data) => {
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
        });

        stream.on('close', () => {
          console.log(chalk.yellow('Session closed'));
        });
      });
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
}

// Start the server
server.listen(SSH_PORT, '0.0.0.0', () => {
  console.log(chalk.green(`🚀 SSH Terminal Server listening on port ${SSH_PORT}`));
  console.log(chalk.yellow(`📡 Connect with: ssh -p ${SSH_PORT} user@your-server-ip`));
  console.log(chalk.blue('🔑 Use any username/password for demo purposes'));
});

server.on('error', (err) => {
  console.error(chalk.red('Server error:', err));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(chalk.yellow('\n🛑 Shutting down SSH server...'));
  server.close(() => {
    console.log(chalk.green('✅ Server closed'));
    process.exit(0);
  });
});
