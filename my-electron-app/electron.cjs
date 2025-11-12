const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess;
let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1024,
        height: 768,
        webPreferences: {
            nodeIntegration: false, 
            contextIsolation: true,
        },
    });

    const indexPath = path.join(__dirname, 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch(err => {
        console.error('Failed to load frontend:', err);
    });
}

function startBackend() {
    const isDev = !app.isPackaged;
    const jarPath = isDev
        ? path.join(__dirname, 'backend', 'excel-to-xml-converter-1.0.0.jar')
        : path.join(process.resourcesPath, 'backend', 'excel-to-xml-converter-1.0.0.jar');

    backendProcess = spawn('java', ['-jar', jarPath], {
        cwd: path.dirname(jarPath),
        shell: true,
        detached: false,
    });

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend exited with code ${code}`);
    });
}

app.whenReady().then(() => {
    startBackend();
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
