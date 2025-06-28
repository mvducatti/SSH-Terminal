const { generateKeyPairSync } = require('crypto');
const fs = require('fs');
const path = require('path');

// Create keys directory if it doesn't exist
const keysDir = path.join(__dirname, 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

console.log('Generating SSH host key...');

// Generate RSA key pair in PEM format for SSH2
const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs1', // Use PKCS1 format for SSH2 compatibility
    format: 'pem'
  }
});

// Save the private key (this is what SSH2 needs)
fs.writeFileSync(path.join(keysDir, 'host_key'), privateKey);
fs.writeFileSync(path.join(keysDir, 'host_key.pub'), publicKey);

console.log('✅ SSH host keys generated successfully!');
console.log('📁 Keys saved in:', keysDir);
