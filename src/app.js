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
 * 1a) process_rendered -> done
 * 1b) infra_rendered -> done
 * 1c) compliance_rendered -> done
 *
 * 2) connect vertex
 * 2a) addInfra2Process
 * 2b) link_requirement-infra -> done
 * 2c) link_requirement-process
 * 2d) link_requirement-requirement -> done
 *
 * 3) update vertex
 * 3a) process: flownode_updated ->done
 * 3a) infra: itcomponent_updated -> done
 *
 */
import bpmnView from "./app/main/bpmn-view.js";
import complianceView from "./app/main/compliance-view";
import infrastructureView from "./app/main/infrastructure-view";
import menuView from "./app/main/menu-view";
import graphView from "./app/main/graph-view";
import graphcontroller from "./app/control/creategraph";
import queryinfra from "./app/control/queryInfrastructure";

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

infraViewer.on('remove_itcomponent_props', function (data) {
    let graph = graphViewer.graph;
    let itcomponent = infraViewer.selectedElement;

    graphcontroller.updateITComponentProperty(graph, itcomponent);
    graphcontroller.updateNeighborsBasedOnProps(graph, itcomponent);
  }
);

complianceViewer.on('compliance_rendered', function (data) {
    console.log(complianceViewer.compliance);
  }
);

complianceViewer.on('link_requirement-requirement', function (data) {
    graphcontroller.addNodes(graphViewer.graph, {
      source_requirement: complianceViewer.selectedSourceRequirement,
      target_requirement: complianceViewer.selectedTargetRequirement
    });
  }
);

complianceViewer.on('link_requirement-infra', function (data) {
    let itcomponent = infraViewer.selectedElement;
    let requirement = complianceViewer.selectedRequirement;
    let graph_infra = infraViewer.graph;
    let graph_viewer = graphViewer.graph;

    if (itcomponent != null) {
      let isUpdated;
      isUpdated = queryinfra.updateITProps(itcomponent, {requirement: requirement});// 1. zu props infra hinzufügen
      if (isUpdated) { //if new Props are added
        graphcontroller.updateITComponentProperty(graph_infra, itcomponent);//2. Graph in infraviewer updaten
        infraViewer.renderITProps(); //3. infraprops neu rendern
        graphcontroller.updateITComponentProperty(graph_viewer, itcomponent); // 4. graph in graphviewer updaten
        graphcontroller.addNodes(graph_viewer, {source_requirement: requirement, target_itcomponent: itcomponent}); // 5. create and link nodes
      }
    }
  }
);

complianceViewer.on('link_requirement-process', function (data) {
    let flowelement = bpmnViewer.selectedElement;
    let requirement = complianceViewer.selectedRequirement;
    let graph_viewer = graphViewer.graph;

    if (flowelement != null) {
      queryinfra.updateITProps(itcomponent, {requirement: requirement});// 1. zu props flowelement hinzufügen
      infraViewer.renderITProps(); //2. processprops neu rendern
      graphcontroller.updateITComponentProperty(graph_viewer, itcomponent); // 3. graph in graphviewer updaten
    }
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
  document.querySelector("#electron-version").innerHTML = process.versions.electron;
}
catch (ex) {
  console.log("Nothing special");
}
