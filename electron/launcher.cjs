const { spawn } = require('child_process');
const electron = require('electron');

// Ensure ELECTRON_RUN_AS_NODE is removed so Electron runs in full GUI desktop mode
const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const child = spawn(electron, ['.', ...process.argv.slice(2)], {
  env,
  stdio: 'inherit',
  windowsHide: false,
});

child.on('exit', (code) => {
  process.exit(code || 0);
});
