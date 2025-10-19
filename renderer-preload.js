const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("embed", {
  openPane: (url) => ipcRenderer.invoke("pane:open", { url }),
  closePane: () => ipcRenderer.invoke("pane:close"),
});

contextBridge.exposeInMainWorld("dcctl_config", {
  getConfig: () => ipcRenderer.invoke("dcctl_config:get-config"),
  getToken: (url) => ipcRenderer.invoke("dcctl_config:get-token", { url }),
});
