const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Determine distribution directory location
const possibleDistPaths = [
  path.join(__dirname, '../dist'),
  path.join(__dirname, 'dist'),
  path.join(process.cwd(), 'dist'),
  path.join(path.dirname(process.execPath), 'dist')
];

let distDir = possibleDistPaths.find(p => fs.existsSync(p));

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.csv': 'text/csv; charset=UTF-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json'
};

function serveFile(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('500 Internal Server Error');
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });
    res.end(data);
  });
}

function startServer(port = 3456) {
  const server = http.createServer((req, res) => {
    if (!distDir) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Rawdons Conference Platform - Build Required</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; padding: 40px; text-align: center; }
            .box { max-width: 600px; margin: 40px auto; background: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155; }
            h2 { color: #38bdf8; }
            code { background: #0f172a; padding: 4px 8px; border-radius: 6px; color: #34d399; }
          </style>
        </head>
        <body>
          <div class="box">
            <h2>Web Assets Not Found</h2>
            <p>Please compile the frontend assets before running this server:</p>
            <p><code>npm run build</code></p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    // Clean request URL
    let safeUrl = req.url.split('?')[0];
    if (safeUrl === '/') safeUrl = '/index.html';

    let filePath = path.join(distDir, safeUrl);

    // Security check - prevent path traversal
    if (!filePath.startsWith(distDir)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('403 Forbidden');
      return;
    }

    fs.stat(filePath, (err, stats) => {
      if (!err && stats.isFile()) {
        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        serveFile(res, filePath, contentType);
      } else {
        // SPA fallback to index.html
        const fallbackPath = path.join(distDir, 'index.html');
        if (fs.existsSync(fallbackPath)) {
          serveFile(res, fallbackPath, 'text/html; charset=UTF-8');
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        }
      }
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    const appUrl = `http://localhost:${port}`;
    console.log('\n=============================================================');
    console.log('   Rawdons - Conference Planning & Operations Platform');
    console.log('   Standalone Windows / Local Edition');
    console.log('=============================================================');
    console.log(`\n  [✓] Server running at: ${appUrl}`);
    console.log(`  [✓] Serving web bundle from: ${distDir || 'Not found'}`);
    console.log('  [✓] All data stays 100% private in local browser storage.');
    console.log('  [✓] Press Ctrl + C in this terminal to close.\n');

    // Launch default browser
    openBrowser(appUrl);
  });
}

function openBrowser(url) {
  const startCmd = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
    ? `open "${url}"`
    : `xdg-open "${url}"`;

  exec(startCmd, (err) => {
    if (err) {
      console.log(`Please open your browser and navigate to: ${url}`);
    }
  });
}

startServer();
