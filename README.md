# SSH Terminal Server

A custom SSH terminal server similar to Primegen's terminal.shop, built with Node.js.

## Features

- 🚀 Custom SSH server with interactive terminal
- 🎨 Colorful ASCII art welcome screen
- 💬 Interactive command system
- 🔒 SSH authentication support
- 🌐 Cross-platform compatibility

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Generate SSH host keys:**
   ```bash
   node generate-keys.js
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Usage

### Connecting locally:
```bash
ssh -p 2222 user@localhost
```

### Connecting from another computer:
```bash
ssh -p 2222 user@YOUR_SERVER_IP
```

## Available Commands

- `help` - Show available commands
- `about` - About this terminal
- `time` - Show current time
- `clear` - Clear the screen
- `exit` - Exit the terminal

## Configuration

- **Port:** 2222 (change in `server.js`)
- **Authentication:** Currently accepts any username/password for demo purposes
- **Host Keys:** Generated in `keys/` directory

## Making it Accessible from Outside

### Option 1: Port Forwarding (Home Network)
1. Forward port 2222 in your router to your computer
2. Use your public IP address to connect

### Option 2: Cloud Deployment (Recommended)
Deploy to services like:
- **Railway** (Free, permanent, recommended - see `RAILWAY_DEPLOY.md`)
- DigitalOcean ($5/month)
- AWS EC2
- Google Cloud

For detailed deployment options, see `SHARING_GUIDE.md`.

## Security Notes

⚠️ **Important:** This is a demo server with basic authentication. For production use:
- Implement proper user authentication
- Use SSH keys instead of passwords
- Add rate limiting
- Implement proper logging
- Use HTTPS/TLS where applicable

## License

MIT
