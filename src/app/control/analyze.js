import cytoscape from "cytoscape";
import creategraph from "./creategraph";
import analyzehelper from "./analyze-helper";

module.exports = {
  getGraphReplaceITComponent,
  getGraphDeleteITComponent,
  getGraphReplaceComplianceProcess,
  getGraphReplaceBusinessActivity,
  getGraphReplaceRequirement,
  getGraphDeleteComplianceProcess,
  getGraphDeleteBusinessActivity,
  getGraphDeleteRequirement
};

//final?
function getGraphReplaceITComponent(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');

  analyzehelper.replaceITDirect(graph, node, result_graph);
  analyzehelper.replaceITTransitive(graph, node, result_graph);

  return result_graph;
}

//final?
function getGraphDeleteITComponent(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');

  analyzehelper.deleteITObsolete(graph, _node, result_graph);
  analyzehelper.deleteITViolation(graph, _node, result_graph);

  return result_graph;
}

function getGraphReplaceRequirement(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');
  analyzehelper.replaceComplianceTransitive(graph, _node, result_graph);
  analyzehelper.replaceComplianceDirect(graph, _node, result_graph);

  return result_graph;
}

function getGraphDeleteRequirement(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');
  analyzehelper.deleteComplianceObsolete(graph, _node, result_graph);
  return result_graph;
}

function getGraphReplaceBusinessActivity(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');
  analyzehelper.replaceActivityDirect(graph, _node, result_graph);
  analyzehelper.replaceProcessTransitive(graph, _node, result_graph);

  return result_graph;
}

function getGraphDeleteBusinessActivity(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');
  analyzehelper.deleteActivityObsolte(graph, _node, result_graph);

  return result_graph;
}

//final?
function getGraphReplaceComplianceProcess(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');

  analyzehelper.replaceComplianceProcessDirect(graph, _node, result_graph);
  analyzehelper.replaceProcessTransitive(graph, _node, result_graph);

  return result_graph;
}

//final?
function getGraphDeleteComplianceProcess(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');

  analyzehelper.deleteComplianceProcessObsolete(graph, _node, result_graph);
  analyzehelper.deleteComplianceProcessViolation(graph, _node, result_graph);

  return result_graph;
}
