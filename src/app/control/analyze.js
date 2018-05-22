import cytoscape from "cytoscape";

module.exports = {
  getGraphChangeITComponent
};

function getGraphChangeITComponent(graph, node) {
  let result_graph = cytoscape({/* options */});
  result_graph.add(node);


  return result_graph;
}

function getGraphChangeRequirement(graph, id) {
  let node = graph.getElementById(id);
  let result_graph = cytoscape({/* options */});

  result_graph.add(node);
  console.log(result_graph);

  return result_graph;
}

function getGraphChangeProcess(graph, id) {
  let node = graph.getElementById(id);
  let result_graph = cytoscape({/* options */});

  result_graph.add(node);
  console.log(result_graph);

  return result_graph;
}

