import processio from "./../app/control/processio";
import dialoghelper from "./fileopen_dialogs";
import log from "./logs";
import path from 'path';
import graphcreator from "./../app/control/creategraph";

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
  let processFilename = getUUID() + ".bpmn.bcit_process";
  let infra = infraViewer.infra;
  let compliance = complianceViewer.compliance;

  let graph = graphViewer.graph;
  let graph_elements = getGraphElements(graph);

  let json = {
    processFilename: processFilename,
    infra: infra,
    compliance: compliance,
    graph_elements: graph_elements
  };

  //save json
  let saveFile = JSON.stringify(json);
  let promise_json = await dialoghelper.bcitFileSaveDialog(saveFile);

//get directory to save process.xml
  let dir = path.dirname(promise_json);
  let filename = dir + "/" + processFilename;
  let promise_processxml = await processio.writeFile(filename, processXml);


  if (promise_json != undefined && promise_processxml != undefined) {
    log.info('Project exported to ' + dir);
  }
}

function getUUID() {
  let dt = new Date().getTime();
  let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    let r = (dt + Math.random() * 16) % 16 | 0;
    dt = Math.floor(dt / 16);
    return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
  return uuid;
}

async function openProject(viewer) {
  let bpmnViewer = viewer.bpmnView;
  let infraViewer = viewer.infraView;
  let complianceViewer = viewer.complianceView;
  let graphViewer = viewer.graphView;

  let filePath = await dialoghelper.bcitFileOpenDialog(); //path of project data

  if (filePath != undefined) {
    let data = await processio.readFile(filePath);
    let json = JSON.parse(data);

    //read json
    let processFilename = json.processFilename;
    let infra = json.infra;
    let compliance = json.compliance;
    let graph_elements = json.graph_elements;

    //read process.bpmn
    let dir = path.dirname(filePath); //get directory of process
    let processPath = dir + "//" + processFilename; //build complete process path
    let processXml = await processio.readFile(processPath); //read process xml

    //set variables in viewers
    bpmnViewer.openProject(processXml);
    infraViewer.openProject(infra);
    complianceViewer.openProject(compliance);
    graphViewer.openProject(graph_elements);

    //update IT component display name
    let graph_view = graphViewer.graph;
    let graph_infra = infraViewer.graph;

    graphcreator.updateITDisplayName(graph_view, graph_infra);
  }
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
