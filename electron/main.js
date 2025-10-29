import { app, BrowserWindow, shell } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const isDev = !!process.env.VITE_DEV_SERVER_URL || process.env.NODE_ENV === 'development'

let mainWindow = null

function resolveIconPath() {
  const iconsDir = path.join(__dirname, '../build/icons')
  if (process.platform === 'win32') return path.join(iconsDir, 'app.ico')
  if (process.platform === 'darwin') return path.join(iconsDir, 'app.icns')
  return path.join(__dirname, '../public/Logo.png')
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    icon: resolveIconPath(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
      // Enable Web Speech API
      experimentalFeatures: true
    }
  })

  // Enable media access (microphone)
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    if (permission === 'media') {
      callback(true)
    } else {
      callback(false)
    }
  })

  mainWindow.once('ready-to-show', () => mainWindow && mainWindow.show())

  if (isDev) {
const devServerURL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5175'
    mainWindow.loadURL(devServerURL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html')
    mainWindow.loadFile(indexPath)
  }

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(() => {
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.neural-pad.app')
  }

  // Enable Speech Recognition
  app.commandLine.appendSwitch('enable-speech-dispatcher')
  app.commandLine.appendSwitch('enable-speech-input')

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
