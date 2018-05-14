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
 * 2a) link_infra-process
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
import queryprocess from "./app/control/queryprocess";
import processeditor from "./app/control/editprocess";

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

bpmnViewer.on('flowelement_updated', function (data) {
    let graph = graphViewer.graph;
    let flowelement = bpmnViewer.selectedElement;

    graphcontroller.updateFlownodeProperty(graph, flowelement);
    graphcontroller.updateComplianceNode(graph, flowelement);
    graphcontroller.updateNeighborsBasedOnProps(graph, flowelement);
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
      requirement: complianceViewer.selectedSourceRequirement,
      requirement_2: complianceViewer.selectedTargetRequirement
    });
  }
);

complianceViewer.on('link_requirement-infra', function (data) {
    let itcomponent = infraViewer.selectedElement;
    let requirement = complianceViewer.selectedRequirement;
    let graph_infra = infraViewer.graph;
    let graph_viewer = graphViewer.graph;

    if (itcomponent != null) {
      let isUniqueProp = queryinfra.isUniqueProp(itcomponent, {requirement: requirement});
      if (isUniqueProp) { //if new Props are added
        queryinfra.updateITProps(itcomponent, {requirement: requirement});// 1. zu props infra hinzufügen
        graphcontroller.updateITComponentProperty(graph_infra, itcomponent);//2. Graph in infraviewer updaten
        infraViewer.renderITProps(); //3. infraprops neu rendern
        graphcontroller.updateITComponentProperty(graph_viewer, itcomponent); // 4. graph in graphviewer updaten
        graphcontroller.addNodes(graph_viewer, {requirement: requirement, itcomponent: itcomponent}); // 5. create and link nodes
      }
    }
  }
);

complianceViewer.on('link_requirement-process', function (data) {
    let flowelement = bpmnViewer.selectedElement;
    let bpmn_viewer = bpmnViewer.viewer;
    let requirement = complianceViewer.selectedRequirement;
    let graph_viewer = graphViewer.graph;

    if (flowelement != null && requirement != null) {
      let extension = processeditor.createExtensionElement('compliance', requirement.id);
      let isUniqueExt = queryprocess.isUniqueExtension(bpmn_viewer, flowelement, extension);

      if (isUniqueExt) {
        processeditor.addExtension(bpmn_viewer, flowelement, extension); // 1. zu props flowelement hinzufügen
        bpmnViewer.renderProcessProps(); //2. processprops neu rendern
        graphcontroller.updateFlownodeProperty(graph_viewer, flowelement); // 3. graph in graphviewer updaten
        graphcontroller.addNodes(graph_viewer, {requirement: requirement, flowelement: flowelement}); // 4. create and link nodes
      }
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
