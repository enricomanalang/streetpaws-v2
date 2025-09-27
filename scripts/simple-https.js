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

// Create HTTPS options
const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error('❌ HTTPS Server Error:', err);
      console.log('💡 Try running: npm run setup:https');
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`🚀 HTTPS Server ready on https://${hostname}:${port}`);
      console.log('🔐 Geolocation should now work!');
      console.log('⚠️  Accept the certificate warning in your browser');
    });
});
