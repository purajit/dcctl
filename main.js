const { app, BrowserWindow, BrowserView, ipcMain } = require("electron");
const fs = require("fs").promises;
const path = require("path");

app.commandLine.appendSwitch("ignore-certificate-errors");

let win;
const views = new Map(); // key: clusterId -> BrowserView
let activeView = null;

// layout constants for the embedded content area
const LAYOUT = { left: 300, top: 0 }; // sidebar width + topbar height

function setViewBounds() {
  if (!win || !activeView) return;
  const [w, h] = win.getContentSize();
  activeView.setBounds({
    x: LAYOUT.left,
    y: LAYOUT.top,
    width: w - LAYOUT.left,
    height: h - LAYOUT.top,
  });
  activeView.setAutoResize({ width: true, height: true });
}

function ensureView({ url }) {
  let v = views.get(url);
  if (v) return v;

  v = new BrowserView({
    webPreferences: {
      url,
      contextIsolation: true,
      // preload: path.join(__dirname, 'pve-preload.js'), // optional
    },
  });
  views.set(url, v);
  v.webContents.loadURL(url);
  return v;
}

function showView(id) {
  const v = views.get(id);
  if (!v) return;

  // detach previous
  if (activeView) win.removeBrowserView(activeView);

  activeView = v;
  win.addBrowserView(v);
  setViewBounds();
}

function hideView() {
  if (activeView) win.removeBrowserView(activeView);
  activeView = null;
}

function destroyView(id) {
  const v = views.get(id);
  if (!v) return;
  if (activeView === v) {
    win.removeBrowserView(v);
    activeView = null;
  }
  v.webContents.destroy();
  views.delete(id);
}

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1500,
    height: 950,
    frame: false,
    webPreferences: {
      contextIsolation: true,
      preload: path.join(__dirname, "renderer-preload.js"), // exposes ipc to the sidebar
    },
  });
  win.maximize();
  win.loadFile("index.html");
  win.on("resize", setViewBounds);
});

// IPC from renderer (sidebar)
ipcMain.handle("pane:open", (e, { url }) => {
  ensureView({ url });
  showView(url);
});

ipcMain.handle("pane:close", (e) => hideView());
ipcMain.handle("pane:destroy", (e, { url }) => destroyView(url));
ipcMain.handle("infractl_config:get-config", async (e) => {
  const text = await fs.readFile(
    path.join(app.getPath("home"), ".config/infractl"),
    "utf8",
  );
  return JSON.parse(text);
});
ipcMain.handle("infractl_config:get-token", async (e, { url }) => {
  const text = await fs.readFile(
    path.join(app.getPath("home"), ".cache/infractl", `${url}-token`),
    "utf8",
  );
  return text;
});
