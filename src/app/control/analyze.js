import cytoscape from "cytoscape";
import querygraph from "./querygraph";
import creategraph from "./creategraph";

module.exports = {
  getGraphReplaceITComponent,
  getGraphDeleteITComponent
};

function getGraphReplaceITComponent(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');

  replaceITDirect(graph, node, result_graph);
  replaceITTransitive(graph, node, result_graph);

  return result_graph;
}

function getGraphDeleteITComponent(graph, node) {
  let result_graph = cytoscape({/* options */});
  let _node = node;

  creategraph.addUniqueNode(result_graph, {node: _node}, 'changedElement');

  deleteITObsolete(graph, _node, result_graph);
  deleteITViolation(graph, _node, result_graph);

  return result_graph;
}

//final - // Replace IT component - Direct
function replaceITDirect(graph, node, result_graph) {
  let _node = node;
  let predecessors = _node.predecessors().filter('node');
  let successors = _node.successors().filter('node');

  for (let i = 0; i < predecessors.length; i++) {
    let pred = predecessors[i];

    if (pred.data('nodetype') == 'compliance') {
      creategraph.addUniqueNode(result_graph, {node: pred}, 'directdemand');

      let nodes_between = querygraph.getNodesBetween(pred, _node);
      for (let j = 0; j < nodes_between.length; j++) {
        let node = nodes_between[j];
        creategraph.addUniqueNode(result_graph, {node: node});
      }
    }
  }
  creategraph.createEdges(graph, result_graph, 'direct');
}

//final - // Replace IT component - Transitiv
function replaceITTransitive(graph, node, result_graph) {
  let _node = node;
  let leaves = querygraph.getLeavesOfType(_node);

  for (let i = 0; i < leaves.length; i++) {
    let leave = leaves[i];
    let dir_leave_sucs = querygraph.getDirectSuccessor(leave);

    for (let j = 0; j < dir_leave_sucs.length; j++) {
      let help_node = dir_leave_sucs[j];

      if (help_node.data('nodetype') == 'businessprocess') { //get compliance of business activity
        let help_node_dir_pred = querygraph.getDirectPredecessor(help_node);

        for (let k = 0; k < help_node_dir_pred.length; k++) {
          let help_pred = help_node_dir_pred[k];
          if (help_pred.data('modeltype') == 'compliance') {
            creategraph.addUniqueNode(result_graph, {node: leave}); //push IT predecessor of business activity
            creategraph.addUniqueNode(result_graph, {node: help_node}); //push business activity
            creategraph.addUniqueNode(result_graph, {node: help_pred}, 'indirectdemand'); //push compliance of business activity

            let node_between = querygraph.getNodesBetween(_node, leave); //add nodes between change element and IT predecessor of business activity
            for (let l = 0; l < node_between.length; l++) {
              creategraph.addUniqueNode(result_graph, {node: node_between[l]});
            }

            let compliance_pred = help_pred.predecessors().filter('node[modeltype = "compliance"]'); //get predecessor of compliance of business activity
            for (let l = 0; l < compliance_pred.length; l++) {
              creategraph.addUniqueNode(result_graph, {node: compliance_pred[l]});
            }
          }
        }
      } else if (help_node.data('nodetype') == 'complianceprocess') { //get compliance of compliance process
        let help_sucs = querygraph.getDirectSuccessor(help_node);

        for (let k = 0; k < help_sucs.length; k++) {
          let help_suc_node = help_sucs[k];

          creategraph.addUniqueNode(result_graph, {node: leave}); //push IT predecessor of compliance process
          creategraph.addUniqueNode(result_graph, {node: help_node}); //push compliance process

          let node_between = querygraph.getNodesBetween(_node, leave); //add nodes between change element and IT predecessor of business activity
          for (let l = 0; l < node_between.length; l++) {
            creategraph.addUniqueNode(result_graph, {node: node_between[l]});
          }

          if (help_suc_node.data('modeltype') == 'compliance') {
            creategraph.addUniqueNode(result_graph, {node: help_suc_node}, 'indirectdemand'); //push compliance of compliance process

            let compliance_pred = help_suc_node.predecessors().filter('node[modeltype = "compliance"]'); //get predecessor of compliance of compliance process

            for (let l = 0; l < compliance_pred.length; l++) {
              creategraph.addUniqueNode(result_graph, {node: compliance_pred[l]});
            }
          }
        }
      }
    }
  }

  // get indirect demands by compliance of succeeding IT components
  let IT_suc = _node.successors().filter('node[modeltype = "infra"]');

  for (let i = 0; i < IT_suc.length; i++) {
    let IT_component = IT_suc[i];
    let dir_IT_pred = querygraph.getDirectPredecessor(IT_component);

    for (let j = 0; j < dir_IT_pred.length; j++) {
      let help_node = dir_IT_pred[j];

      if (help_node.data('modeltype') == 'compliance') {
        creategraph.addUniqueNode(result_graph, {node: IT_component}); // add IT component

        let node_between = querygraph.getNodesBetween(_node, IT_component); //add nodes between change element and IT
        for (let l = 0; l < node_between.length; l++) {
          creategraph.addUniqueNode(result_graph, {node: node_between[l]});
        }

        creategraph.addUniqueNode(result_graph, {node: help_node}, 'indirectdemand'); // add compliance (=pred of IT component)

        let compliance_pred = help_node.predecessors().filter('node[modeltype = "compliance"]');
        for (let l = 0; l < compliance_pred.length; l++) { //add predecessor of compliance of IT component
          creategraph.addUniqueNode(result_graph, {node: compliance_pred[l]});
        }
      }
    }
  }

  creategraph.createEdges(graph, result_graph, 'indirect'); //create Edges
}

//final -// Remove IT - Obsolete
function deleteITObsolete(graph, node, result_graph) {
  let _node = node;
  let IT_suc = _node.successors().filter('node[modeltype = "infra"]');

  //check obsolete compliance of succeding IT
  for (let i = 0; i < IT_suc.length; i++) {
    let IT_component = IT_suc[i];

    let dir_IT_pred = querygraph.getDirectPredecessor(IT_component);

    for (let j = 0; j < dir_IT_pred.length; j++) {
      let help_node = dir_IT_pred[j];

      if (help_node.data('modeltype') == 'compliance') {

        if (querygraph.getDirectSuccessor(help_node).length == 1) { // if compliance has more than one successor, dont remove it
          creategraph.addUniqueNode(result_graph, {node: IT_component}); // add IT component

          let node_between = querygraph.getNodesBetween(_node, IT_component); //add nodes between change element and IT
          for (let l = 0; l < node_between.length; l++) {
            creategraph.addUniqueNode(result_graph, {node: node_between[l]});
          }

          creategraph.addUniqueNode(result_graph, {node: help_node}, 'obsolete'); // add compliance (=pred of IT component)

          let compliance_preds = help_node.predecessors().filter('node[modeltype = "compliance"]');

          for (let k = 0; k < compliance_preds.length; k++) {
            let compliance_pred = compliance_preds[k];

            if (querygraph.getDirectSuccessor(compliance_pred).length == 1) { //if compliance has no other successor
              creategraph.addUniqueNode(result_graph, {node: compliance_pred}, 'obsolete'); // add pred of compliance
            }
          }
        }
      }
    }
  }

  //check obsolete Compliance of node
  let dir_pred = querygraph.getDirectPredecessor(_node);

  for (let i = 0; i < dir_pred.length; i++) {
    let help_node = dir_pred[i];

    if (help_node.data('modeltype') == 'compliance') {
      if (querygraph.getDirectSuccessor(help_node).length == 1) { // if compliance has more than one successor, dont remove it

        creategraph.addUniqueNode(result_graph, {node: help_node}, 'obsolete'); // add compliance (=pred of IT component)

        let compliance_preds = help_node.predecessors().filter('node[modeltype = "compliance"]');

        for (let k = 0; k < compliance_preds.length; k++) {
          let compliance_pred = compliance_preds[k];

          if (querygraph.getDirectSuccessor(compliance_pred).length == 1) { //if compliance has no other successor
            creategraph.addUniqueNode(result_graph, {node: compliance_pred}, 'obsolete'); // add pred of compliance
          }
        }
      }
    }
  }

  creategraph.createEdges(graph, result_graph, 'indirect'); //create Edges
}

//Remove IT - Violation
function deleteITViolation(graph, node, result_graph) {



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
