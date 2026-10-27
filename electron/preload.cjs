const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  resizeFloating: (mode) => ipcRenderer.send('floating-resize', mode),
  openMainWindow: () => ipcRenderer.send('open-main-window'),
  closeFloating: () => ipcRenderer.send('close-floating'),
  quitApp: () => ipcRenderer.send('quit-app'),
  setIgnoreMouseEvents: (ignore, forward) => ipcRenderer.send('set-ignore-mouse-events', ignore, forward),
  onToggleFloating: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('toggle-floating-hotkey', handler);
    return () => ipcRenderer.removeListener('toggle-floating-hotkey', handler);
  },
});
