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
import analyzeView from "./app/main/analyze-view";

import linkmodel from "./app/control/linkmodels";
import analyze from "./app/control/analyze";

let graphViewer = new graphView({document});
let bpmnViewer = new bpmnView({document});
let complianceViewer = new complianceView({document});
let infraViewer = new infrastructureView({document});
let menuViewer = new menuView({document});
let analyzeViewer = new analyzeView({document});

bpmnViewer.on('process_rendered', function (data) {
    graphViewer.renderGraph({process: bpmnViewer.process});
  }
);

infraViewer.on('infra_rendered', function (data) {
    graphViewer.renderGraph({infra: infraViewer.infra});
    console.log(infraViewer.infra);
  }
);

complianceViewer.on('compliance_rendered', function (data) {

  }
);

bpmnViewer.on('flowelement_updated', function (data) {
    let graph = graphViewer.graph;
    let flowelement = bpmnViewer.selectedElement;
    let viewer = bpmnViewer.viewer;

    linkmodel.updateFlowelement(viewer, graph, flowelement);
  }
);

bpmnViewer.on('analyze', function (data) {
    console.log('analyze from process');
    console.log(data.id);
  }
);

infraViewer.on('remove_itcomponent_props', function (data) {
    let graph_viewer = graphViewer.graph;
    let graph_infra = infraViewer.graph;
    let itcomponent = infraViewer.selectedElement;

    linkmodel.updateITComponent({graph_viewer: graph_viewer, graph_infra: graph_infra}, itcomponent);
  }
);

infraViewer.on('link_infra-process', function (data) {
    let flowelement = bpmnViewer.selectedElement;
    let shape = bpmnViewer.selectedShape;
    let viewer = bpmnViewer.viewer;
    let itcomponent = infraViewer.selectedElement;
    let graph = graphViewer.graph;

    linkmodel.linkInfra2Process(bpmnViewer, viewer, graph, flowelement, shape, itcomponent);
  }
);

infraViewer.on('analyze', function (data) {
    let graph = graphViewer.graph;
    let node = graph.getElementById(data.id);

    if (node.length>0) {
      let result_graph = analyze.getGraphChangeITComponent(graph, node);
      analyzeViewer.showAnalyze(result_graph);
    }
  }
);

complianceViewer.on('link_requirement-requirement', function (data) {
    let graph = graphViewer.graph;
    let source_requirement = complianceViewer.selectedSourceRequirement;
    let target_requirement = complianceViewer.selectedTargetRequirement;

    linkmodel.linkRequirement2Requirement(graph, source_requirement, target_requirement);
  }
);

complianceViewer.on('link_requirement-infra', function (data) {
    let itcomponent = infraViewer.selectedElement;
    let requirement = complianceViewer.selectedRequirement;
    let graph_viewer = graphViewer.graph;

    linkmodel.linkRequirement2Infra(graph_viewer, infraViewer, requirement, itcomponent);
  }
);

complianceViewer.on('link_requirement-process', function (data) {
    let flowelement = bpmnViewer.selectedElement;
    let shape = bpmnViewer.selectedShape;
    let viewer = bpmnViewer.viewer;
    let requirement = complianceViewer.selectedRequirement;
    let graph = graphViewer.graph;

    linkmodel.linkRequirement2Process(bpmnViewer, viewer, graph, flowelement, shape, requirement);
  }
);

complianceViewer.on('analyze', function (data) {
    let graph = graphViewer.graph;
    let node = graph.getElementById(data.id);

    if (node.length>0) {
      let result_graph = analyze.getGraphChangeITComponent(graph, node);
      analyzeViewer.showAnalyze(result_graph);
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
