const { app, BrowserWindow, ipcMain, globalShortcut, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

const http = require('http');

let bridgeServer = null;

function startBridgeServer() {
  if (bridgeServer) return;
  bridgeServer = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');

    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    if (req.url === '/ping') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ running: true }));
      return;
    }

    if (req.url === '/show-floating') {
      if (!floatingWindow || floatingWindow.isDestroyed()) {
        createFloatingBubbleWindow();
      } else {
        floatingWindow.show();
        floatingWindow.focus();
        floatingWindow.setAlwaysOnTop(true, 'screen-saver');
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
      return;
    }

    res.writeHead(404);
    res.end();
  });

  bridgeServer.on('error', (err) => {
    console.warn('[BridgeServer] Error:', err.message);
  });

  bridgeServer.listen(38241, '127.0.0.1', () => {
    console.log('[BridgeServer] Listening on http://127.0.0.1:38241 for Chrome web requests');
  });
}

const fs = require('fs');

let mainWindow = null;
let floatingWindow = null;
let tray = null;
let dragInterval = null;

// Position Memory Engine: Prevents floating window from jumping across screen
let savedLogoPosition = null; // { x: number, y: number }
let currentFloatingMode = 'logo'; // 'logo' | 'expanded'
let userDraggedWhileExpanded = false;

const isDev = process.env.ELECTRON_DEV === '1' || !app.isPackaged;
const DEV_URL = 'http://localhost:5173';

function getAppUrl(params = '') {
  if (isDev) {
    return `${DEV_URL}${params ? `?${params}` : ''}`;
  }
  const indexPath = path.join(__dirname, '../dist/index.html');
  return `file://${indexPath}${params ? `?${params}` : ''}`;
}

// 1. Create Main Full Dashboard Window (Clean Webpage with NO in-page popups)
function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    return;
  }

  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 900,
    minHeight: 600,
    title: 'TaskToggle - Deepak Organization Task Manager',
    backgroundColor: '#F8FAFC',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(getAppUrl());
  mainWindow.webContents.on('did-fail-load', () => {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) mainWindow.loadURL('file://' + indexPath);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 2. Create OS-Level Floating Bubble Window (Transparent & Always On Top, Floats over all apps & games)
function createFloatingBubbleWindow() {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.show();
    floatingWindow.focus();
    floatingWindow.setAlwaysOnTop(true, 'screen-saver');
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Initial bubble dimensions (logo size with badge padding)
  const initialWidth = 90;
  const initialHeight = 90;
  const initialX = Math.max(20, screenWidth - initialWidth - 24);
  const initialY = Math.max(40, screenHeight - initialHeight - 120);

  if (!savedLogoPosition) {
    savedLogoPosition = { x: initialX, y: initialY };
  }

  floatingWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    x: initialX,
    y: initialY,
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    alwaysOnTop: true,
    hasShadow: false,
    resizable: true, // Allows smooth movement across Windows displays
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Keep floating window on top of all other windows (even full screen games/apps)
  floatingWindow.setAlwaysOnTop(true, 'screen-saver');
  floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });

  floatingWindow.loadURL(getAppUrl('mode=floating-bubble'));
  floatingWindow.webContents.on('did-fail-load', () => {
    const indexPath = path.join(__dirname, '../dist/index.html');
    if (fs.existsSync(indexPath)) floatingWindow.loadURL('file://' + indexPath + '?mode=floating-bubble');
  });

  floatingWindow.on('closed', () => {
    floatingWindow = null;
    if (dragInterval) {
      clearInterval(dragInterval);
      dragInterval = null;
    }
  });
}

// 3. Create Windows System Tray Icon
function createTray() {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <rect width="18" height="18" x="3" y="3" rx="4" fill="#4F46E5"/>
      <path stroke="white" d="m8.5 12.5 2.5 2.5 5-5"/>
    </svg>
  `.trim();

  const iconBuffer = Buffer.from(svgIcon);
  const trayIcon = nativeImage.createFromBuffer(iconBuffer).resize({ width: 16, height: 16 });

  try {
    tray = new Tray(trayIcon);
  } catch (err) {
    tray = new Tray(nativeImage.createEmpty());
  }

  tray.setToolTip('TaskToggle - Deepak Organization');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open TaskToggle Dashboard',
      click: () => createMainWindow(),
    },
    {
      label: 'Toggle Floating Bubble',
      click: () => {
        if (!floatingWindow || floatingWindow.isDestroyed()) {
          createFloatingBubbleWindow();
        } else if (floatingWindow.isVisible()) {
          floatingWindow.hide();
        } else {
          floatingWindow.show();
        }
      },
    },
    { type: 'separator' },
    {
      label: 'Organization: Deepak',
      enabled: false,
    },
    {
      label: 'Quit TaskToggle',
      click: () => {
        app.isQuitting = true;
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);
  tray.on('click', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isVisible()) {
        mainWindow.focus();
      } else {
        mainWindow.show();
      }
    } else {
      createMainWindow();
    }
  });
}

// Global Cursor Drag Engine (100% reliable mouse drag anywhere across PC screen)
ipcMain.on('start-drag-floating', () => {
  if (!floatingWindow || floatingWindow.isDestroyed()) return;

  const initialMouse = screen.getCursorScreenPoint();
  const initialWindowPos = floatingWindow.getPosition();

  const offsetX = initialMouse.x - initialWindowPos[0];
  const offsetY = initialMouse.y - initialWindowPos[1];

  if (dragInterval) clearInterval(dragInterval);

  dragInterval = setInterval(() => {
    if (!floatingWindow || floatingWindow.isDestroyed()) {
      clearInterval(dragInterval);
      dragInterval = null;
      return;
    }

    const currentMouse = screen.getCursorScreenPoint();
    floatingWindow.setPosition(
      Math.round(currentMouse.x - offsetX),
      Math.round(currentMouse.y - offsetY)
    );
  }, 10); // 100fps silky smooth cursor tracking
});

ipcMain.on('stop-drag-floating', () => {
  if (dragInterval) {
    clearInterval(dragInterval);
    dragInterval = null;
  }
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    const pos = floatingWindow.getPosition();
    if (currentFloatingMode === 'logo') {
      savedLogoPosition = { x: pos[0], y: pos[1] };
    } else {
      userDraggedWhileExpanded = true;
    }
  }
});

// IPC Window Resizer
ipcMain.on('floating-resize', (event, mode) => {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    createFloatingBubbleWindow();
    return;
  }

  const currentBounds = floatingWindow.getBounds();
  const currentDisplay = screen.getDisplayMatching(currentBounds);
  const workArea = currentDisplay.workArea;

  if (mode === 'expanded') {
    // Save current logo position before shifting to expanded mode
    if (currentFloatingMode === 'logo') {
      savedLogoPosition = { x: currentBounds.x, y: currentBounds.y };
      userDraggedWhileExpanded = false;
    }
    currentFloatingMode = 'expanded';

    const targetWidth = 380;
    const targetHeight = 560;

    let targetX = currentBounds.x;
    let targetY = currentBounds.y;

    if (targetX + targetWidth > workArea.x + workArea.width) {
      targetX = workArea.x + workArea.width - targetWidth - 16;
    }
    if (targetY + targetHeight > workArea.y + workArea.height) {
      targetY = workArea.y + workArea.height - targetHeight - 16;
    }
    targetX = Math.max(workArea.x + 10, targetX);
    targetY = Math.max(workArea.y + 10, targetY);

    floatingWindow.setBounds({
      x: targetX,
      y: targetY,
      width: targetWidth,
      height: targetHeight,
    });
    floatingWindow.show();
    floatingWindow.focus();
  } else {
    // Mode === 'logo'
    const targetWidth = 90;
    const targetHeight = 90;

    let targetX = currentBounds.x;
    let targetY = currentBounds.y;

    if (currentFloatingMode === 'expanded') {
      if (!userDraggedWhileExpanded && savedLogoPosition) {
        // Restore to exact user-placed position!
        targetX = savedLogoPosition.x;
        targetY = savedLogoPosition.y;
      } else {
        // If user dragged expanded window, anchor logo to bottom-right of dragged window
        targetX = currentBounds.x + currentBounds.width - targetWidth;
        targetY = currentBounds.y + currentBounds.height - targetHeight;
      }
    }

    targetX = Math.min(Math.max(workArea.x + 10, targetX), workArea.x + workArea.width - targetWidth - 10);
    targetY = Math.min(Math.max(workArea.y + 10, targetY), workArea.y + workArea.height - targetHeight - 10);

    savedLogoPosition = { x: targetX, y: targetY };
    currentFloatingMode = 'logo';
    userDraggedWhileExpanded = false;

    floatingWindow.setBounds({
      x: targetX,
      y: targetY,
      width: targetWidth,
      height: targetHeight,
    });
  }
});

// Show floating bubble over all apps & games
ipcMain.on('show-floating', () => {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    createFloatingBubbleWindow();
  } else {
    floatingWindow.show();
    floatingWindow.focus();
    floatingWindow.setAlwaysOnTop(true, 'screen-saver');
    floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
});

// Toggle floating bubble
ipcMain.on('toggle-floating', () => {
  if (!floatingWindow || floatingWindow.isDestroyed()) {
    createFloatingBubbleWindow();
  } else if (floatingWindow.isVisible()) {
    floatingWindow.hide();
  } else {
    floatingWindow.show();
    floatingWindow.focus();
    floatingWindow.setAlwaysOnTop(true, 'screen-saver');
    floatingWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  }
});

ipcMain.on('floating-move-by', (event, { dx, dy }) => {
  if (!floatingWindow || floatingWindow.isDestroyed()) return;
  const [currentX, currentY] = floatingWindow.getPosition();
  floatingWindow.setPosition(Math.round(currentX + dx), Math.round(currentY + dy));
});

ipcMain.on('floating-move-to', (event, { x, y }) => {
  if (!floatingWindow || floatingWindow.isDestroyed()) return;
  floatingWindow.setPosition(Math.round(x), Math.round(y));
});

ipcMain.on('open-main-window', () => {
  createMainWindow();
});

ipcMain.on('close-floating', () => {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.hide();
  }
});

ipcMain.on('quit-app', () => {
  app.isQuitting = true;
  app.quit();
});

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    } else {
      createMainWindow();
    }
  });

  app.whenReady().then(() => {
    createMainWindow();
    createFloatingBubbleWindow();
    createTray();
    startBridgeServer();

    // Register Global Shortcut: Ctrl+Alt+T anywhere in Windows
    globalShortcut.register('CommandOrControl+Alt+T', () => {
      if (!floatingWindow || floatingWindow.isDestroyed()) {
        createFloatingBubbleWindow();
      } else if (floatingWindow.isVisible()) {
        floatingWindow.webContents.send('toggle-floating-hotkey');
      } else {
        floatingWindow.show();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
        createFloatingBubbleWindow();
      }
    });
  });
}

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin' && app.isQuitting) {
    app.quit();
  }
});
