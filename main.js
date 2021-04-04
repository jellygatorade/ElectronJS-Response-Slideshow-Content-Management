const { app, BrowserWindow, Menu, globalShortcut } = require('electron')
const ipcMain = require('electron').ipcMain
const Store = require('./store.js');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    //width: 800,
    //height: 600,
    show: false,
    fullscreen: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  // and load the index.html of the app.
  win.loadFile('./slideshow/index.html')

  // Open the DevTools.
  //win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })

  var menu = Menu.buildFromTemplate([
    {
      label: 'Menu',
        submenu: [
          {
            label: 'Exit',
            click() {
                app.quit()
            }
          },
        ]
    },
    {
      label: 'Info'
    }
])

  //Menu.setApplicationMenu(menu);
  Menu.setApplicationMenu(null); // No application menu 

  win.once('ready-to-show', () => {
    win.show()
  })

  // Register escape key to quit the app
  globalShortcut.register('ESC', function() {
    app.quit()
  })

  // Register ctrl (or command) + y key combo to switch html docs
  var windowState = 'slideshow';
  globalShortcut.register('CommandOrControl+Y', function() {
    if (windowState == 'slideshow') {
      win.loadFile('./content-management-interface/index.html')
      windowState = 'content management';
    } else if (windowState == 'content management') {
      win.loadFile('./slideshow/index.html')
      windowState = 'slideshow';
    }
  })

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

// Responsible for Communication of data from Main process to the Renderer Process
// Received the value send from the content-management-interface/script.js file 
// Identifies the data passed based on the Key 
// Which was set in the ipc.send() method in content-management-interface/script.js file   

ipcMain.on('updateResponses', function (event, arg) {
  store.set('configuredResponses', arg);
});

ipcMain.handle('requestResponses', async (event) => {
  const result = store.get('configuredResponses');
  return result
})

/* for storage and retrieval of JSON appdata */
/* the Store class is defined in store.js */
const store = new Store({
    // We'll call our data file 'form-data'
    // It will be saved as /user/AppData/Roaming/*appname*/form-data.json
    configName: 'form-data',
    defaults: {
      configuredResponses: {
        formJSON: {
          q1: "What do you like about art?",
          q1responses: "I like art because of all the pretty colors and forms.\r\n\r\nArt tells us something new about reality.",
          q2: "What did you have for breakfast this morning?",
          q2responses: "Eggs benedict.\r\n\r\nI had bacon and two eggs on toast with butter.\r\n\r\nThis morning we ate leftover cold pizza.",
          q3: "Who is your favorite artist and why?",
          q3responses: "My favorite artist is Ai Weiwei because I like his politics.\r\n\r\nI really like them all it is too hard to choose. Okay if I had to choose I would choose Bob Ross."
        },
        sortedJSON: {
          questions: [
            "What do you like about art?",
            "What did you have for breakfast this morning?",
            "Who is your favorite artist and why?"
          ],
          responses: [
            [
              "I like art because of all the pretty colors and forms.",
              "Art tells us something new about reality."
            ],
            [
              "Eggs benedict.",
              "I had bacon and two eggs on toast with butter.",
              "This morning we ate leftover cold pizza."
            ],
            [
              "My favorite artist is Ai Weiwei because I like his politics.",
              "I really like them all it is too hard to choose. Okay if I had to choose I would choose Bob Ross."
            ]
          ]
        }
      }
    }
});