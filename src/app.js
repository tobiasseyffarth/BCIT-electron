import "./stylesheets/main.css";
import "./stylesheets/bootstrap.css";
import "./stylesheets/property-panel.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

/**************
 * Main
 *
 * emitter:
 * 1) rendering
 * 1a) process_rendered
 * 1b) infra_rendered
 * 1c) compliance_rendered
 *
 * 2) connect vertex
 * 2a) addInfra2Process
 * 2b) addCompliance2Infra
 * 2c) addCompliance2Process
 * 2d) addCompliance2Compliance
 *
 * 3) update vertex
 * 3a) process: flownode_updated
 * 3a) infra: infraelement_updated
 *
 */
import bpmnView from "./app/main/bpmn-view.js";
import complianceView from "./app/main/compliance-view";
import infrastructureView from "./app/main/infrastructure-view";
import menuView from "./app/main/menu-view";
import graphView from "./app/main/graph-view";
import graphcontroller from "./app/control/creategraph";

let graphViewer = new graphView({document});
let bpmnViewer = new bpmnView({document});
let complianceViewer = new complianceView({document});
let infraViewer = new infrastructureView({document});
let menuViewer = new menuView({document});


bpmnViewer.on('process_rendered', function (data) {
    graphViewer.renderGraph({process: bpmnViewer.process});
    console.log(bpmnViewer.process);
  }
);

bpmnViewer.on('flownode_updated', function (data) {
    graphcontroller.updateFlownodeProperty(graphViewer.graph, bpmnViewer.selectedElement);
  }
);

infraViewer.on('infra_rendered', function (data) {
    graphViewer.renderGraph({infra: infraViewer.infra});
  }
);

complianceViewer.on('compliance_rendered', function (data) {
    console.log(complianceViewer.compliance);
  }
);

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import {remote} from "electron";
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

try {
  document.querySelector("#app").style.display = "block";
  document.querySelector("#os").innerHTML = osMap[process.platform];
  document.querySelector("#author").innerHTML = manifest.author;
  document.querySelector("#env").innerHTML = env.name;
  document.querySelector("#electron-version").innerHTML =
    process.versions.electron;
}
catch (ex) {
  console.log("Nothing special");
}
