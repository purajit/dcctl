const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("embed", {
  openPane: (url) => ipcRenderer.invoke("pane:open", { url }),
  closePane: () => ipcRenderer.invoke("pane:close"),
});

contextBridge.exposeInMainWorld("infractl_config", {
  getConfig: () => ipcRenderer.invoke("infractl_config:get-config"),
  getToken: (url) => ipcRenderer.invoke("infractl_config:get-token", { url }),
});
