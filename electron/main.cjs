const { app, BrowserWindow, ipcMain, globalShortcut, screen, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let mainWindow = null;
let floatingWindow = null;
let tray = null;

const isDev = process.env.ELECTRON_DEV === '1' || !app.isPackaged;
const DEV_URL = 'http://localhost:5173';

function getAppUrl(params = '') {
  if (isDev) {
    return `${DEV_URL}${params ? `?${params}` : ''}`;
  }
  const indexPath = path.join(__dirname, '../dist/index.html');
  return `file://${indexPath}${params ? `?${params}` : ''}`;
}

// 1. Create Main Full Dashboard Window
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
    backgroundColor: '#F5F7FD',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.loadURL(getAppUrl());

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 2. Create OS-Level Floating Bubble Window (Transparent & Always On Top)
function createFloatingBubbleWindow() {
  if (floatingWindow && !floatingWindow.isDestroyed()) {
    floatingWindow.show();
    return;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  // Initial bubble dimensions (logo size)
  const initialWidth = 72;
  const initialHeight = 72;
  const initialX = Math.max(20, screenWidth - initialWidth - 24);
  const initialY = Math.max(40, screenHeight - initialHeight - 120);

  floatingWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    x: initialX,
    y: initialY,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
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

  floatingWindow.on('closed', () => {
    floatingWindow = null;
  });
}

// 3. Create Windows System Tray Icon
function createTray() {
  // 16x16 icon SVG base64
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
    // Fallback if svg buffer isn't supported directly on older native image
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

// IPC Handlers
ipcMain.on('floating-resize', (event, mode) => {
  if (!floatingWindow || floatingWindow.isDestroyed()) return;

  const currentBounds = floatingWindow.getBounds();
  const currentDisplay = screen.getDisplayMatching(currentBounds);
  const workArea = currentDisplay.workArea;

  if (mode === 'expanded') {
    const targetWidth = 380;
    const targetHeight = 560;

    let targetX = currentBounds.x;
    let targetY = currentBounds.y;

    // Reposition safely if expanded box overflows the screen edge
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
  } else {
    // Mode === 'logo'
    const targetWidth = 72;
    const targetHeight = 72;

    floatingWindow.setBounds({
      x: currentBounds.x,
      y: currentBounds.y,
      width: targetWidth,
      height: targetHeight,
    });
  }
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

    // Register Global Shortcut: Ctrl+Alt+T or Cmd+Alt+T anywhere in Windows
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
  // Keep app active in system tray if user only closed main window
  if (process.platform !== 'darwin' && app.isQuitting) {
    app.quit();
  }
});
