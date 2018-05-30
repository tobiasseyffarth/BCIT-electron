import cytoscape from "cytoscape";
import creategraph from "./creategraph";
import analyzehelper from "./analyze-helper";

module.exports = {
  getGraphReplaceITComponent,
  getGraphDeleteITComponent,
  getGraphReplaceComplianceProcess,
  getGraphReplaceBusinessActivity
};

function getGraphReplaceITComponent(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');

  analyzehelper.replaceITDirect(graph, node, result_graph);
  analyzehelper.replaceITTransitive(graph, node, result_graph);

  return result_graph;
}

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

  result_graph.add(_node);
  console.log(result_graph);

  return result_graph;
}

function getGraphDeleteRequirement(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  result_graph.add(_node);
  console.log(result_graph);

  return result_graph;
}

function getGraphReplaceBusinessActivity(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  result_graph.add(_node);


  return result_graph;
}

function getGraphDeleteBusinessActivity(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  result_graph.add(_node);

  return result_graph;
}

function getGraphReplaceComplianceProcess(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  result_graph.add(_node);


  return result_graph;
}

function getGraphDeleteComplianceProcess(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  result_graph.add(_node);

  return result_graph;
}
