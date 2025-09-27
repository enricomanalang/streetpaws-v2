const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create certs directory if it doesn't exist
const certsDir = path.join(__dirname, '../certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

console.log('🔐 Generating self-signed certificates for localhost...');

try {
  // Check if we can use Node.js crypto module to generate certificates
  const crypto = require('crypto');
  const forge = require('node-forge');
  
  console.log('Using Node.js crypto to generate certificates...');
  
  // Generate a key pair
  const keys = forge.pki.rsa.generateKeyPair(2048);
  const cert = forge.pki.createCertificate();
  
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + 1);
  
  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
  }]);
  
  cert.sign(keys.privateKey);
  
  // Convert to PEM format
  const certPem = forge.pki.certificateToPem(cert);
  const keyPem = forge.pki.privateKeyToPem(keys.privateKey);
  
  // Write files
  fs.writeFileSync(path.join(certsDir, 'localhost.pem'), certPem);
  fs.writeFileSync(path.join(certsDir, 'localhost-key.pem'), keyPem);
  
  console.log('✅ Certificates generated successfully!');
  console.log('📁 Location: certs/localhost.pem and certs/localhost-key.pem');
  console.log('🚀 You can now run: npm run dev:https');
  
} catch (error) {
  console.log('❌ Node.js crypto method failed, trying alternative...');
  
  // Fallback: Create a simple certificate using PowerShell
  const powershellScript = `
    $cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "cert:\\CurrentUser\\My" -NotAfter (Get-Date).AddYears(1)
    $pwd = ConvertTo-SecureString -String "password" -Force -AsPlainText
    Export-PfxCertificate -Cert $cert -FilePath "certs\\localhost.pfx" -Password $pwd
    Write-Host "Certificate created: certs/localhost.pfx"
    Write-Host "Note: You'll need to convert this to PEM format for Node.js"
  `;
  
  try {
    execSync(`powershell -Command "${powershellScript}"`, { stdio: 'inherit' });
    console.log('⚠️  PowerShell certificate created, but you may need to convert it to PEM format.');
    console.log('💡 Alternative: Use Git Bash and run: ./scripts/generate-certs.sh');
  } catch (psError) {
    console.log('❌ All methods failed. Please install OpenSSL or use Git Bash.');
    console.log('💡 Options:');
    console.log('   1. Install Git for Windows (includes Git Bash)');
    console.log('   2. Install OpenSSL for Windows');
    console.log('   3. Use the address search or map clicking features instead');
    process.exit(1);
  }
}
