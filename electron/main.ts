import { app, BrowserWindow } from 'electron';
import path from 'path';
// import { ServerConfig, startServer } from '@trainlink-org/typescript-server';
// import { ServerConfig, isDebug } from '@trainlink-org/typescript-server';
// import { ServerConfig, isDebug } from '../../typescript-server/src';
import { io, Socket } from 'socket.io-client';

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js
// │ ├─┬ preload
// │ │ └── index.js
// │ ├─┬ renderer
// │ │ └── index.html

process.env.ROOT = path.join(__dirname, '..');
process.env.DIST = path.join(process.env.ROOT, 'dist-electron');
process.env.VITE_PUBLIC = process.env.VITE_DEV_SERVER_URL
    ? path.join(process.env.ROOT, 'public')
    : path.join(process.env.ROOT, '.output/public');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

let win: BrowserWindow;
// const preload = path.join(process.env.DIST, 'preload.js');

function bootstrap() {
    win = new BrowserWindow({
        webPreferences: {
            // preload,
            nodeIntegrationInWorker: true,
            contextIsolation: false,
            nodeIntegration: true,
            webSecurity: false,
        },
    });

    if (process.env.VITE_DEV_SERVER_URL) {
        win.loadURL(process.env.VITE_DEV_SERVER_URL);
        win.webContents.openDevTools();
    } else {
        win.loadFile(path.join(process.env.VITE_PUBLIC!, 'index.html'));
    }
}
// const config: ServerConfig = {
//     configPath: './',
//     port: 6868,
//     productName: 'TrainLink Command Integrated Server',
// };
// hello();
// console.log(isDebug);
// startServer(config);
const socket = io('localhost:6868');
app.whenReady().then(bootstrap);
