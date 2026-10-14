const { contextBridge, ipcRenderer } = require('electron');

// Expose safe desktop environment flags and handlers to the renderer
contextBridge.exposeInMainWorld('desktopApp', {
  isDesktop: true,
  platform: process.platform,
  version: '1.0.0',
  onMenuExport: (callback) => {
    ipcRenderer.on('menu:export', () => callback());
  }
});
