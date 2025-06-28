const os = require('os');

function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  
  return '127.0.0.1';
}

const localIP = getLocalIPAddress();

console.log('\n🌐 SSH Terminal Server Connection Info:');
console.log('─'.repeat(50));
console.log(`📍 Local IP Address: ${localIP}`);
console.log(`🔗 Local Connection: ssh -p 2222 user@localhost`);
console.log(`🔗 Remote Connection: ssh -p 2222 user@${localIP}`);
console.log('─'.repeat(50));
console.log('💡 Share the remote connection command with others on your network!');

console.log('\n🌍 To share with friends ANYWHERE (not just your network):');
console.log('─'.repeat(60));
console.log('🚀 Option 1: ngrok (Recommended)');
console.log('   1. Install ngrok: https://ngrok.com/download');
console.log('   2. Run: ngrok tcp 2222');
console.log('   3. Share the provided address with friends');
console.log('');
console.log('🌐 Option 2: localtunnel');
console.log('   1. npm install -g localtunnel');
console.log('   2. Run: lt --port 2222');
console.log('   3. Share the provided URL');
console.log('');
console.log('☁️  Option 3: Cloud deployment (permanent)');
console.log('   Deploy to DigitalOcean, AWS, or Railway');
console.log('─'.repeat(60));
console.log('💡 Run "node setup-ngrok.js" for detailed ngrok setup!');
