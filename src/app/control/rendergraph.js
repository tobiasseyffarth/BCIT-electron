import log from "../../helpers/logs";
import cytoscape from "cytoscape";
import querygraph from "./querygraph";
import creategraph from "./creategraph";

function drawGraph(container) {
  let graph = cytoscape({
    container: container,
    elements: [ // list of graph elements to start with
      { // node a
        data: {id: 'a'}
      },
      { // node b
        data: {id: 'b'}
      },
      { // node b
        data: {id: 'c'}
      },
      { // edge ab
        data: {id: 'ab', source: 'a', target: 'b'}
      }
    ],

    style: [ // the stylesheet for the graph
      {
        selector: 'node',
        style: {
          'background-color': '#666',
          'label': 'data(id)'
        }
      },

      {
        selector: 'edge',
        style: {
          'width': 3,
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle'
        }
      }
    ],

    layout: {
      name: 'grid',
      rows: 1
    }
  }); // create an empty graph and define its style

  renderGraph(graph);

  return graph;

}

function renderGraph(g) {
  // creategraph.createGraphFromInfra(this.graph, infraclass.infra);
  let layout = g.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
  g.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
  layout.run();
  g.autolock(false); //elements can not be moved by the user
  log.info('graph rendered');

  g.reset();//Groesse anpassen

  g.resize();
  g.fit();// alle KNoten werden im Container angzeigt


  console.log('rendered');
  //this.graphContainer.textContent="hallo welt;"
}

function resizeGraph(graph) {
  graph.reset();//Groesse anpassen
  graph.fit();// alle KNoten werden im Container angzeigt
  graph.resize(); //Komplette Container nutzen
}

function clearGraph(graph) {
  creategraph.removeSingleNodes(graph);
  removeIT(graph);
}

function removeIT(graph) {
  let nodes = graph.nodes();
  let removed;

  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    if (node.data('nodetype') === 'infra') {
      let dir_pred = querygraph.getDirectPredecessor(node);
      if (dir_pred.length === 0 && node.data('nodestyle') !== 'changedElement') {
        node.remove();
        removed = true;
      }
    }
  }

  if (removed) {
    removeIT(graph);
  }
}

function removeActivity(graph) {
  let _nodes = graph.nodes();

  for (let i = 0; i < _nodes.length; i++) {
    let node = _nodes[i];
    let nodetype = node.data('nodetype');
    let nodestyle = node.data('nodestyle');

    console.log(nodetype);
    console.log(nodestyle);

    if (nodetype === 'businessprocess' && nodestyle === 'between') {
      node.remove();
    }
  }
}

function drawAnalyze(graph) {
  let changed_node = graph.nodes().filter('node[nodestyle = "changedElement"]')[0]; //only one change node possible
  let nodetype = changed_node.data('nodetype');

  if (nodetype === 'infra' || nodetype === 'complianceprocess') {
    updateInfraCP(changed_node);
    clearGraph(graph);
  }

  if (nodetype === 'compliance') {
    console.log('update compliance')
    updateCompliance(changed_node);
    clearGraph(graph);
  }

  if (nodetype === 'businessprocess') {
    console.log('update business process');
    updateBusinessProcess(changed_node);
    clearGraph(graph);
  }

}

function updateInfraCP(node) {
  let changed_node = node;

  changed_node.position({x: 270, y: 150});
  let x_changed = changed_node.position('x');
  let y_changed = changed_node.position('y');

  //consider compliance of changed_node
  if (changed_node.data('nodetype') !== 'complianceprocess') {
    let compliance_preds = querygraph.getPredecessors(changed_node, 'compliance');
    drawCompliancePreds(changed_node, compliance_preds);
  }

  if (changed_node.data('nodetype') === 'complianceprocess') {
    let dir_comp_sucs = querygraph.getDirectSuccessor(changed_node, 'compliance');

    for (let i = 0; i < dir_comp_sucs.length; i++) {
      let compliance = dir_comp_sucs[i];
      let x_compliance = x_changed + (i + 1) * 100;
      let y_compliance = y_changed;
      compliance.position({x: x_compliance, y: y_compliance});

      let com_preds = querygraph.getPredecessors(compliance, 'compliance');
      drawCompliancePreds(compliance, com_preds);
    }
  }

  //consider infra_preds and its compliance requirements
  let preds = querygraph.getPredecessors(changed_node, '!compliance');

  for (let i = 0; i < preds.length; i++) {
    let node = preds[i];
    let x_node = x_changed;
    let y_node = y_changed + (i + 1) * 80;
    node.position({x: x_node, y: y_node});

    let compliance_preds = querygraph.getPredecessors(node, 'compliance');

    drawCompliancePreds(node, compliance_preds);
  }

  //consider sucs
  let sucs = querygraph.getSuccessors(changed_node, '!compliance');

  for (let i = 0; i < sucs.length; i++) {
    let node = sucs[i];
    let x_node = x_changed;
    let y_node = y_changed - (i + 1) * 80;
    node.position({x: x_node, y: y_node});

    if (node.data('nodetype') !== 'complianceprocess') {
      let compliance_preds = querygraph.getPredecessors(node, 'compliance');
      drawCompliancePreds(node, compliance_preds);
    }

    if (node.data('nodetype') === 'complianceprocess') {
      //consider compliance of compliance process
      let dir_comp_sucs = querygraph.getDirectSuccessor(node, 'compliance');
      let x_compliance;
      let y_compliance;

      for (let j = 0; j < dir_comp_sucs.length; j++) {
        let compliance = dir_comp_sucs[j];
        x_compliance = x_node + (j + 1) * 100;
        y_compliance = y_node;
        compliance.position({x: x_compliance, y: y_compliance});

        let com_preds = querygraph.getPredecessors(compliance, 'compliance');
        drawCompliancePreds(compliance, com_preds);
      }
    }
  }
}

function drawCompliancePreds(node, compliance_preds) {
  let x_node = node.position('x');
  let y_node = node.position('y');

  for (let j = 0; j < compliance_preds.length; j++) {
    let compliance = compliance_preds[j];
    let x_compliance = x_node + (j + 1) * 100;
    let y_compliance = y_node;
    compliance.position({x: x_compliance, y: y_compliance});
  }
}


function updateBusinessProcess(node) {
  let changed_node = node;

  changed_node.position({x: 270, y: 150});
  let x_changed = changed_node.position('x');
  let y_changed = changed_node.position('y');

  let dir_comp_preds = querygraph.getDirectPredecessor(changed_node, 'compliance');
  for (let i = 0; i < dir_comp_preds.length; i++) {

    let compliance = dir_comp_preds[i];

    let x_compliance = x_changed + (i + 1) * 100;
    let y_compliance = y_changed + (i + 1) * 100;
    compliance.position({x: x_compliance, y: y_compliance});

    //draw compliance preds horizontal
    let comp_preds = querygraph.getPredecessors(compliance, 'compliance');
    drawCompliancePreds(compliance, comp_preds);


    //draw other preds vertical
    let preds = querygraph.getPredecessors(compliance, '!compliance');

    for (let j = 0; j < preds.length; j++) {
      let pred = preds[j];
      if (pred !== changed_node) { //avoid that predecessor is the changed element
        let x_pred = x_compliance;
        let y_pred = y_compliance - (j + 1) * 100;

        pred.position({x: x_pred, y: y_pred});

        comp_preds = querygraph.getPredecessors(pred, 'compliance');
        drawCompliancePreds(pred, comp_preds);
      }
    }
  }
}

function updateCompliance(node) {
  console.log('update compliance');

  let changed_node = node;

  changed_node.position({x: 270, y: 150});
  let x_changed = changed_node.position('x');
  let y_changed = changed_node.position('y');

  //consider compliance preds
  let compliance_preds = querygraph.getPredecessors(changed_node, 'compliance');
  for (let i = 0; i < compliance_preds.length; i++) {
    let compliance = compliance_preds[i];
    let x_compliance = x_changed - (i + 1) * 100;
    let y_compliance = y_changed - (i + 1) * 100;
    compliance.position({x: x_compliance, y: y_compliance});

    //draw other preds vertical
    let preds = querygraph.getPredecessors(compliance, '!compliance');

    for (let j = 0; j < preds.length; j++) {
      let pred = preds[j];
      if (pred !== changed_node) { //avoid that predecessor is the changed element
        let x_pred = x_compliance;
        let y_pred = y_compliance - (j + 1) * 100;

        pred.position({x: x_pred, y: y_pred});

        let comp_preds = querygraph.getPredecessors(pred, 'compliance');
        drawCompliancePreds(pred, comp_preds);
      }
    }
  }

  // consider compliance sucs
  let compliance_sucs = querygraph.getSuccessors(changed_node, 'compliance');
  for (let i = 0; i < compliance_sucs.length; i++) {
    let compliance = compliance_sucs[i];
    let x_compliance = x_changed + (i + 1) * 100;
    let y_compliance = y_changed + (i + 1) * 100;
    compliance.position({x: x_compliance, y: y_compliance});

    //draw other preds vertical
    let preds = querygraph.getPredecessors(compliance, '!compliance');

    for (let j = 0; j < preds.length; j++) {
      let pred = preds[j];
      if (pred !== changed_node) { //avoid that predecessor is the changed element
        let x_pred = x_compliance;
        let y_pred = y_compliance - (j + 1) * 100;

        pred.position({x: x_pred, y: y_pred});

        let comp_preds = querygraph.getPredecessors(pred, 'compliance');
        drawCompliancePreds(pred, comp_preds);
      }
    }
  }


  //consider preds != compliance
  let preds = querygraph.getPredecessors(changed_node, '!compliance');

  for (let j = 0; j < preds.length; j++) {
    let pred = preds[j];
    if (pred !== changed_node) { //avoid that predecessor is the changed element
      let x_pred = x_changed;
      let y_pred = y_changed - (j + 1) * 100;

      pred.position({x: x_pred, y: y_pred});

      let comp_preds = querygraph.getPredecessors(pred, 'compliance');
      drawCompliancePreds(pred, comp_preds);
    }
  }
}

module.exports = {
  resizeGraph,
  drawAnalyze,
  clearGraph,
  removeActivity
};
