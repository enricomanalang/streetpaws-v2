const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;

// Check if certificates exist
const certPath = path.join(__dirname, '../certs/localhost.pem');
const keyPath = path.join(__dirname, '../certs/localhost-key.pem');

if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error('❌ Certificates not found. Please run: npm run setup:https');
  process.exit(1);
}

console.log('🔐 Loading certificates...');

// Create HTTPS options
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

console.log('🚀 Starting Next.js with HTTPS...');

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log('✅ Next.js prepared successfully');
  
  const server = createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      console.log(`📡 ${req.method} ${req.url}`);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('❌ Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  server.on('error', (err) => {
    console.error('❌ HTTPS Server Error:', err);
    if (err.code === 'EADDRINUSE') {
      console.log('💡 Port 3000 is already in use. Try stopping other servers first.');
    }
    process.exit(1);
  });

  server.listen(port, hostname, () => {
    console.log(`🎉 HTTPS Server ready!`);
    console.log(`🔗 URL: https://${hostname}:${port}`);
    console.log(`🗺️  Geolocation should now work!`);
    console.log(`⚠️  Accept the certificate warning in your browser`);
  });
}).catch((err) => {
  console.error('❌ Failed to prepare Next.js:', err);
  process.exit(1);
});
