const express = require('express');
const { createServer } = require('http');
const { Server: SocketIOServer } = require('socket.io');
const chalk = require('chalk');
const figlet = require('figlet');

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Main page
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Marcos' Terminal Shop</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            margin: 0;
            padding: 0;
            background: #0a0a0a;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            overflow: hidden;
        }
        #terminal {
            width: 100vw;
            height: 100vh;
            padding: 20px;
            box-sizing: border-box;
            overflow-y: auto;
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        #input {
            background: transparent;
            border: none;
            color: #00ff00;
            font-family: 'Courier New', monospace;
            font-size: 14px;
            outline: none;
            width: 100%;
        }
        .prompt {
            color: #00ff00;
        }
        .output {
            color: #ffffff;
        }
        .error {
            color: #ff4444;
        }
        .info {
            color: #44aaff;
        }
        .warning {
            color: #ffaa44;
        }
        .success {
            color: #44ff44;
        }
    </style>
</head>
<body>
    <div id="terminal">
        <div class="info">Connecting to terminal...</div>
    </div>
    
    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io();
        const terminal = document.getElementById('terminal');
        let currentInput = '';
        
        function addToTerminal(text, className = 'output') {
            const div = document.createElement('div');
            div.className = className;
            div.innerHTML = text;
            terminal.appendChild(div);
            terminal.scrollTop = terminal.scrollHeight;
        }
        
        function createInputLine() {
            const inputLine = document.createElement('div');
            inputLine.innerHTML = '<span class="prompt">$ </span><input type="text" id="currentInput" autocomplete="off">';
            terminal.appendChild(inputLine);
            
            const input = document.getElementById('currentInput');
            input.focus();
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    const command = input.value;
                    addToTerminal('$ ' + command, 'prompt');
                    socket.emit('command', command);
                    inputLine.remove();
                }
            });
            
            terminal.scrollTop = terminal.scrollHeight;
        }
        
        socket.on('connect', () => {
            terminal.innerHTML = '';
            socket.emit('start');
        });
        
        socket.on('output', (data) => {
            addToTerminal(data.text, data.type || 'output');
            if (!data.noPrompt) {
                createInputLine();
            }
        });
        
        socket.on('disconnect', () => {
            addToTerminal('Connection lost. Refresh to reconnect.', 'error');
        });
        
        // Focus input when clicking anywhere
        document.addEventListener('click', () => {
            const input = document.getElementById('currentInput');
            if (input) input.focus();
        });
    </script>
</body>
</html>
  `);
});

// Store user sessions
const sessions = new Map();

function generateWelcomeMessage() {
  try {
    const banner = figlet.textSync('Terminal Shop', {
      font: 'Small',
      horizontalLayout: 'default',
      verticalLayout: 'default'
    });

    return `${banner}

==============================================================
  Welcome to Marcos' Terminal Shop!
  A web-based terminal experience
==============================================================

Available commands:
  help     - Show available commands
  about    - About this terminal
  time     - Show current time
  date     - Show full date
  whoami   - Show user info
  uptime   - Show server uptime
  clear    - Clear the screen
  exit     - Close terminal

Type a command and press Enter:
`;
  } catch (error) {
    return `
==============================================================
  Welcome to Marcos' Terminal Shop!
  A web-based terminal experience
==============================================================

Available commands:
  help     - Show available commands
  about    - About this terminal
  time     - Show current time
  date     - Show full date
  whoami   - Show user info
  uptime   - Show server uptime
  clear    - Clear the screen
  exit     - Close terminal

Type a command and press Enter:
`;
  }
}

function processCommand(command) {
  try {
    if (command === 'help') {
      return `
Available Commands:
────────────────────────────────────────
help      - Show this help message
about     - Information about this terminal
time      - Display current date and time
date      - Display full date and time
whoami    - Display current user info
uptime    - Show server uptime
clear     - Clear the terminal screen
exit      - Close the terminal

Tips:
- This is a web-based terminal server
- Built with Node.js and Socket.IO
- Accessible from any browser
`;
    }

    if (command === 'about') {
      return `
About Terminal Shop
──────────────────────────
This is a web-based terminal server built with Node.js
Inspired by Primegen's terminal.shop

Features:
- Web-based terminal interface
- Real-time communication
- Cross-platform support
- Zero-install access

Built by: Marcos
Version: 2.0.0 (Web Edition)
`;
    }

    if (command === 'time') {
      return `Current time: ${new Date().toLocaleString()}`;
    }

    if (command === 'date') {
      return new Date().toString();
    }

    if (command === 'whoami') {
      return 'You are connected to Marcos\' Terminal Shop!';
    }

    if (command === 'uptime') {
      const uptime = process.uptime();
      const hours = Math.floor(uptime / 3600);
      const minutes = Math.floor((uptime % 3600) / 60);
      const seconds = Math.floor(uptime % 60);
      return `Server uptime: ${hours}h ${minutes}m ${seconds}s`;
    }

    if (command === 'clear') {
      return { type: 'clear' };
    }

    if (command === 'exit') {
      return { type: 'exit', message: 'Goodbye! Thanks for visiting the terminal!' };
    }

    if (command === '') {
      return '';
    }

    return `Command not found: ${command}\\nType "help" for available commands.`;
  } catch (error) {
    return `Error processing command: ${command}\\nType "help" for available commands.`;
  }
}

io.on('connection', (socket) => {
  console.log(chalk.green('Client connected:'), socket.id);
  
  socket.on('start', () => {
    const welcomeMessage = generateWelcomeMessage();
    socket.emit('output', { text: welcomeMessage, type: 'success' });
  });

  socket.on('command', (command) => {
    console.log(chalk.blue(`Command from ${socket.id}:`), command);
    
    const result = processCommand(command.trim());
    
    if (typeof result === 'object') {
      if (result.type === 'clear') {
        socket.emit('output', { text: '', type: 'clear' });
        const welcomeMessage = generateWelcomeMessage();
        socket.emit('output', { text: welcomeMessage, type: 'success' });
      } else if (result.type === 'exit') {
        socket.emit('output', { text: result.message, type: 'warning', noPrompt: true });
        socket.disconnect();
      }
    } else {
      socket.emit('output', { text: result });
    }
  });

  socket.on('disconnect', () => {
    console.log(chalk.yellow('Client disconnected:'), socket.id);
  });
});

server.listen(PORT, () => {
  console.log(chalk.green(`🚀 Web Terminal Server running on port ${PORT}`));
  console.log(chalk.yellow(`🌐 Visit: https://web-production-96f1d.up.railway.app`));
  console.log(chalk.blue('💻 Accessible from any browser!'));
});

server.on('error', (err) => {
  console.error(chalk.red('Server error:', err.message));
});
