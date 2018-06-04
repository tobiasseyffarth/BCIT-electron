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
import aboutView from "./app/main/about-view";

import linkmodel from "./app/control/linkmodels";
import analyze from "./app/control/analyze";
import queryprocess from "./app/control/queryprocess";
import projectupdater from "./helpers/update_project";
import log from "./../src/helpers/logs";

let graphViewer = new graphView({document});
let bpmnViewer = new bpmnView({document});
let complianceViewer = new complianceView({document});
let infraViewer = new infrastructureView({document});
let menuViewer = new menuView({document});
let analyzeViewer = new analyzeView({document});
let aboutViewer = new aboutView({document});

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
    let graph = graphViewer.graph;
    let node = graph.getElementById(data.id);
    let result_graph;
    let key = data.key;
    let shape = bpmnViewer.selectedShape;
    let element = shape.businessObject;
    let isComplianceProcess = queryprocess.isCompliance(element);

    if (node.length > 0) { //avoid click on documents not part of the graph
      if (key === 17) { // crtl. -> delete
        if (queryprocess.isExtensionShape(shape) && queryprocess.isDataStore({shape: shape})) { //change IT
          result_graph = analyze.getGraphDeleteITComponent(graph, node);
          analyzeViewer.showAnalyze(result_graph, 'Analyze: Delete IT component');
        } else if (queryprocess.isExtensionShape(shape) && queryprocess.isDataObjectRef({shape: shape})) { //change requirement
          result_graph = analyze.getGraphDeleteRequirement(graph, node);
          analyzeViewer.showAnalyze(result_graph, 'Analyze: Delete Compliance Requirement');
        } else if (isComplianceProcess) { //change complianceProcess
          result_graph = analyze.getGraphDeleteComplianceProcess(graph, node);
          analyzeViewer.showAnalyze(result_graph, 'Analyze: Delete Compliance Process');
        } else { //change business activity
          result_graph = analyze.getGraphDeleteBusinessActivity(graph, node);
          analyzeViewer.showAnalyze(result_graph, 'Analyze: Delete Business Activity');
        }
      } else if (key === 18) { //alt.-> replace
        if (queryprocess.isExtensionShape(shape) && queryprocess.isDataStore({shape: shape})) {
          result_graph = analyze.getGraphReplaceITComponent(graph, node);
          analyzeViewer.showAnalyze(result_graph, 'Analyze: Replace IT Component');
        }else if(queryprocess.isExtensionShape(shape) && queryprocess.isDataObjectRef({shape: shape})){
          result_graph = analyze.getGraphReplaceRequirement(graph, node);
          analyzeViewer.showAnalyze(result_graph, 'Analyze: Replace Compliance Requirement');
        } else if (isComplianceProcess) {
          result_graph = analyze.getGraphReplaceComplianceProcess(graph, node);
          analyzeViewer.showAnalyze(result_graph, 'Analyze: Replace Compliance Process');
        } else {
          result_graph = analyze.getGraphReplaceBusinessActivity(graph, node);
          analyzeViewer.showAnalyze(result_graph, 'Analyze: Replace Business Activity');
        }
      }
    }
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
    let result_graph;
    let key = data.key;

    if (node.length > 0) { //avoid to click an element that is not part of the graph
      if (key == 17) { // crtl. -> delete
        result_graph = analyze.getGraphDeleteITComponent(graph, node);
        analyzeViewer.showAnalyze(result_graph, 'Analyze: Delete IT component');
      } else if (key == 18) { //alt. -> replace
        result_graph = analyze.getGraphReplaceITComponent(graph, node);
        analyzeViewer.showAnalyze(result_graph, 'Analyze: Replace IT component');
      }
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
    let key = data.key;

    if (key === 17) { //-> ctrl: delete
      if (node.length > 0) {
        let result_graph = analyze.getGraphDeleteRequirement(graph, node);
        analyzeViewer.showAnalyze(result_graph, 'Analyze: Delete Compliance Requirement');
      }else{
        log.info('The selected compliance requirement is not linked to any other element.');
      }
    }else if(key===18){ //alt. -> replace
      if (node.length > 0) {
        let result_graph = analyze.getGraphReplaceRequirement(graph, node);
        analyzeViewer.showAnalyze(result_graph, 'Analyze: Replace Compliance Requirement');
      }else{
        log.info('The selected compliance requirement is not linked to any other element.');
      }
    }
  }
);

menuViewer.on('newproject', function (data) {
    projectupdater.newProject({
      bpmnView: bpmnViewer,
      infraView: infraViewer,
      complianceView: complianceViewer,
      graphView: graphViewer
    });
  }
);

menuViewer.on('openproject', function (data) {
    projectupdater.openProject({
      bpmnView: bpmnViewer,
      infraView: infraViewer,
      complianceView: complianceViewer,
      graphView: graphViewer
    });
  }
);

menuViewer.on('saveproject', function (data) {
    projectupdater.saveProject({
      bpmnView: bpmnViewer,
      infraView: infraViewer,
      complianceView: complianceViewer,
      graphView: graphViewer
    });
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
