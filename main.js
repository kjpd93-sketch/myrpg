const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 850,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true
    },
    title: "D&D RPG Dungeon Crawler",
    autoHideMenuBar: true
  });

  win.loadFile('index.html');

  // Fenster nach dem Laden sofort fokussieren — behebt Electron-Bug bei dem
  // der erste Klick auf ein Input-Feld den Window-Fokus "verbraucht" statt
  // das Feld zu aktivieren.
  win.webContents.on('did-finish-load', () => {
    win.focus();
  });

  // Open DevTools if running in development (optional, can be opened via Ctrl+Shift+I)
  // win.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
