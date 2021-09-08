// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const fs = require('fs')
const {autoUpdater} = require("electron-updater")

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 300,
    height: 100,
    autoHideMenuBar: true,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      nativeWindowOpen:false,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  // Open the DevTools.
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on("ready", () => {
	autoUpdater.checkForUpdatesAndNotify()
});
// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

const {downloadAMR, extractAMR, moveAMR, clean, msg, checkManifest, checkVersion} = require('./helpers.js')
const target = path.normalize(path.join(__dirname, '/', 'dist'))
const { dialog } = require('electron')
let folder = ''

ipcMain.on('choose-folder', (event) => {
  dialog.showOpenDialog({ properties: ['openDirectory'] }).then(async f => {
    if(f.canceled) return
    folder = path.normalize(f.filePaths[0])
    const manifest = path.normalize(path.join(folder, 'manifest.json'))
    if(fs.existsSync(manifest)) {
      try {
        await checkManifest(manifest)
        await checkVersion(folder)
        event.sender.send('init', 'Update AMR')
      } catch(e) {
        event.sender.send('message', msg(e, true))
        event.sender.send('close')
      }
    } else {
      event.sender.send('init', 'Install AMR')
    }
  })
})


ipcMain.on('start', async(event) => {
  try {
    await clean(folder).catch((e) => event.sender.send('message', msg("Couldn't clean previous install: "+e, true)))
    event.sender.send('message', msg('1/5 downloading AMR..'))
    await downloadAMR(folder).catch((e) => event.sender.send('message', msg("Couldn't download AMR: "+e, true)))
    event.sender.send('message', msg('2/5 Extracting files...'))
    await extractAMR(folder).catch((e) => event.sender.send('message', msg("Couldn't extract AMR: "+e, true)))
    event.sender.send('message', msg('3/5 Moving files to parent path'))
    await moveAMR(folder).catch((e) => event.sender.send('message', msg("MV: "+e.message, true)))
    event.sender.send('message', msg('4/5 Cleaning artifacts'))
    await clean(folder, false).catch((e)=> event.sender.send('message', msg("Couldn't delete artifacts: "+e, true)))
    event.sender.send('message', msg('5/5 Done.'))
    event.sender.send('close')
  } catch(e) {
    event.sender.send('message', msg(e, true))
    event.sender.send('close', true)
  }
})

ipcMain.on('close',() => {
  app.quit()
})