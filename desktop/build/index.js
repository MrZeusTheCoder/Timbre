"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var electron_1 = require("electron");
function create_window() {
    var window = new electron_1.BrowserWindow({
        webPreferences: {
            nodeIntegration: true
        },
        width: 890,
        height: 540,
        backgroundColor: "#000",
        minWidth: 595,
        minHeight: 540,
        frame: false,
        autoHideMenuBar: true,
        icon: __dirname + '/icon.ico'
    });
    window.webContents.toggleDevTools();
    window.loadURL("file://" + __dirname + "/index.html");
}
electron_1.app.on('ready', function () {
    create_window();
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    //(FROM: https://github.com/electron/electron-quick-start-typescript/blob/master/src/main.ts)
    electron_1.app.on('activate', function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            create_window();
        }
    });
});
// app.inject_menu = function (m) {
//     Menu.setApplicationMenu(Menu.buildFromTemplate(m));
// }
electron_1.app.on('window-all-closed', function () {
    electron_1.app.quit();
});
