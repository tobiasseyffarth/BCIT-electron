import processio from "./../app/control/processio";
import dialoghelper from "./fileopen_dialogs";
import log from "./logs";

module.exports = {
  newProject,
  openProject,
  saveProject
};

function newProject(viewer) {
  let bpmnViewer = viewer.bpmnView;
  let infraViewer = viewer.infraView;
  let complianceViewer = viewer.complianceView;
  let graphViewer = viewer.graphView;

  bpmnViewer.newProject();
  infraViewer.newProject();
  complianceViewer.newProject();
  graphViewer.newProject();
}

async function saveProject(viewer) {
  let bpmnViewer = viewer.bpmnView;
  let infraViewer = viewer.infraView;
  let complianceViewer = viewer.complianceView;
  let graphViewer = viewer.graphView;

  let processXml = processio.getXml(bpmnViewer.viewer);
  let infra = infraViewer.infra;
  let compliance = complianceViewer.compliance;

  let graph = graphViewer.graph;
  let graph_elements = getGraphElements(graph);

  let json = getJsonSaveProject({
    process: processXml,
    infra: infra,
    compliance: compliance,
    graph_elements: graph_elements
  });

  let saveFile = JSON.stringify(json);
  let promise = await dialoghelper.projectFileSaveDialog(saveFile); //todo: hier async arbeiten um promise zu verwerten

  if (promise != undefined) {
    log.info('Project exported to ' + promise);
  }
}

function openProject() {

}

function getJsonSaveProject(input) {
  let process = input.process;
  let infra = input.infra;
  let compliance = input.compliance;
  let graphelements = input.graph_elements;
  let exportFile = {process: undefined, infra: undefined, compliance: undefined, graph_elements: undefined};

  exportFile.process = process;
  exportFile.infra = infra;
  exportFile.compliance = compliance;
  exportFile.graph_elements = graphelements;

  return exportFile;
}

function getGraphElements(graph) {
  let result = [];
  let nodes = graph.nodes();
  let edges = graph.edges();

  let graphelements = {
    node: [],
    edge: []
  };

  for (let i = 0; i < nodes.length; i++) {
    let _node = nodes[i];
    let n = new node();

    n.id = _node.data('id');
    n.name = _node.data('name');
    n.props = _node.data('props');
    n.nodetype = _node.data('nodetype');
    n.modeltype = _node.data('modeltype');
    n.display_name = _node.data('display_name');
    n.nodestyle = _node.data('nodestyle');

    graphelements.node.push(n);
  }

  for (let i = 0; i < edges.length; i++) {
    let _edge = edges[i];
    let e = new edge();

    e.id = _edge.data('id');
    e.source = _edge.data('source');
    e.target = _edge.data('target');
    e.edgestyle = _edge.data('edgestyle');

    graphelements.edge.push(e);
  }

  return graphelements;
}


class node {
  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.props = undefined;
    this.nodetype = undefined;
    this.modeltype = undefined;
    this.display_name = undefined;
    this.nodestyle = '';
  }
}

class edge {
  constructor() {
    this.id = undefined;
    this.source = undefined;
    this.target = undefined;
    this.edgestyle = undefined;
  }
}
