import "./stylesheets/main.css";
import "./stylesheets/bootstrap.css";
import "./stylesheets/property-panel.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

/**************
 * Main
 */
import bpmnView from "./app/main/bpmn-view.js";
import complianceView from "./app/main/compliance-view";

let bpmnViewer        = new bpmnView({document});
let complianceViewer  = new complianceView({document});

console.log(bpmnViewer.getViewer());

bpmnViewer.on('rendered', (data) => console.log('Done rendering', data));

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import env from "env";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const osMap = {
  win32: "Windows",
  darwin: "macOS",
  linux: "Linux"
};

try{
  document.querySelector("#app").style.display = "block";
  document.querySelector("#os").innerHTML = osMap[process.platform];
  document.querySelector("#author").innerHTML = manifest.author;
  document.querySelector("#env").innerHTML = env.name;
  document.querySelector("#electron-version").innerHTML =
    process.versions.electron;
}
catch(ex) { console.log("Nothing special"); }
