const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

// Ensure single instance lock so multiple windows don't conflict
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Rawdons - Conference Planning & Operations Platform',
    backgroundColor: '#0f172a', // Matches slate-900 theme
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: true,
      spellcheck: false
    },
    show: false // Wait until ready-to-show for a clean, flash-free startup
  });

  // Load the built app from dist/index.html
  const distPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    // If running in development without a pre-built dist
    mainWindow.loadURL('http://localhost:3000').catch(() => {
      mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Rawdons Conference Platform - Build Required</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
              .card { background: #1e293b; padding: 40px; border-radius: 16px; border: 1px solid #334155; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
              h1 { color: #38bdf8; font-size: 24px; margin-bottom: 12px; }
              p { color: #94a3b8; font-size: 14px; line-height: 1.6; }
              code { background: #0f172a; padding: 4px 8px; border-radius: 6px; color: #34d399; font-family: monospace; font-size: 13px; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Distribution Build Not Found</h1>
              <p>Please compile the web assets first by running:</p>
              <p><code>npm run build</code></p>
              <p>Then restart the desktop app with: <code>npm run desktop:start</code></p>
            </div>
          </body>
        </html>
      `)}`);
    });
  }

  // Gracefully show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Intercept links to open in external OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('mailto:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupMenu();
}

function setupMenu() {
  const isMac = process.platform === 'darwin';
  const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'Export Backup / CSV',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu:export');
            }
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        {
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
          click: () => {
            if (mainWindow) mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Rawdons Platform Documentation',
          click: async () => {
            await shell.openExternal('https://github.com');
          }
        },
        {
          label: 'About Rawdons Conference Platform',
          click: () => {
            dialog.showMessageBox({
              type: 'info',
              title: 'About Rawdons Conference Platform',
              message: 'Rawdons - Conference Planning & Operations Platform',
              detail: 'Version 1.0.0 Standalone Windows Desktop Edition.\\n\\nAll data persists locally in secure application storage.\\nConfigured with South African Rands (ZAR), departmental checklists, guest allocation, and crew dispatch.',
              buttons: ['OK']
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
