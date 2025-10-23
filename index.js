const RESOURCE_LIST_DIV = document.getElementById("list");

const config = window.dcctl_config.getConfig();
(async () => {
  renderList(await config);
})();

function renderList(config) {
  const html = config.datacenters
    .map(
      (dc, dc_idx) => `
    <div class="group">
    <h2>${dc.name}</h2>
    ${dc.items.map((it, it_idx) => itemRow(it, dc_idx, it_idx)).join("")}
    </div>
  `,
    )
    .join("");
  RESOURCE_LIST_DIV.innerHTML = html;
}

function itemRow(it, dc_idx, it_idx) {
  const meta = it.url;
  let iconurl;
  if (it.type === "proxmox") {
    iconurl = "./images/proxmox.png";
  } else if (it.type === "croit") {
    iconurl = "./images/ceph.png";
  } else if (it.type === "drp") {
    iconurl = "./images/drp.png";
  } else if (it.type === "artifactory") {
    iconurl = "./images/artifactory.png";
  } else if (it.type === "apt-cacher-ng") {
    iconurl = "./images/apt-cacher-ng.png";
  }
  return `
  <div class="item-container flex-row" id="item-${dc_idx}-${it_idx}" onclick="selectItem(${dc_idx}, ${it_idx})">
    <div class="icon">
      <img width=20px src="${iconurl}">
    </div>
    <div class="item flex-col">
        <div class="name">${it.name || it.type}</div>
        <div class="meta">${meta}</div>
    </div>
  </div>`;
}

async function selectItem(dc_idx, it_idx) {
  const it = (await config).datacenters[dc_idx].items[it_idx];
  [...document.getElementsByClassName("item-container")].forEach((el) =>
    el.classList.remove("selected"),
  );
  document.getElementById(`item-${dc_idx}-${it_idx}`).classList.add("selected");
  openUrl(it.url);
}

function openUrl(url) {
  window.embed.openPane(url);
}
