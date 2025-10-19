const { app, BrowserWindow, BrowserView, ipcMain } = require("electron");
const fs = require("fs").promises;
const path = require("path");

let win;
let activeView = null;
const views = new Map();
const SIDEBAR_WIDTH = 250;
const HOME_DIR = app.getPath("home");

app.whenReady().then(() => {
  win = new BrowserWindow({
    frame: false,
    icon: "./images/icon.png",
    titleBarStyle: "none",
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "renderer-preload.js"),
    },
  });

  win.maximize();
  win.loadFile("index.html");
});
app.commandLine.appendSwitch("ignore-certificate-errors");

ipcMain.handle("pane:open", (e, { url }) => showView(url));
ipcMain.handle("pane:close", (e) => hideCurrentView());
ipcMain.handle("dcctl_config:get-config", async (e) => {
  return JSON.parse(
    await fs.readFile(path.join(HOME_DIR, ".config/dcctl"), "utf8"),
  );
});

function showView(url) {
  hideCurrentView();

  if (!views.has(url)) {
    views.set(
      url,
      new BrowserView({
        webPreferences: {
          url,
          contextIsolation: true,
        },
      }),
    );
  }

  const v = views.get(url);
  views.set(url, v);
  v.webContents.loadURL(url);
  activeView = v;

  win.addBrowserView(v);

  const [w, h] = win.getContentSize();
  activeView.setBounds({
    x: SIDEBAR_WIDTH,
    y: 0,
    width: w - SIDEBAR_WIDTH,
    height: h,
  });
  activeView.setAutoResize({ width: true, height: true });
}

function hideCurrentView() {
  if (activeView) win.removeBrowserView(activeView);
  activeView = null;
}
