const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const os = require('os');

let backendProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  win.webContents.openDevTools();
}

app.whenReady().then(() => {
 
  const backendPath = path.join(__dirname, 'backend', 'excel-to-xml-converter-1.0.0.jar');
  
 
  const javaExecutable = os.platform() === 'win32' ? 'java.exe' : 'java';
  const backendArgs = ['-jar', backendPath];

  backendProcess = spawn(javaExecutable, backendArgs);

  
  backendProcess.stdout.on('data', (data) => console.log(`[backend]: ${data}`));
  backendProcess.stderr.on('data', (data) => console.error(`[backend error]: ${data}`));


  createWindow();

 
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (backendProcess) backendProcess.kill();  
    app.quit();
  }
});
