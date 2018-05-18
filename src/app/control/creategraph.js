import cytoscape from 'cytoscape';
import queryinfra from './queryInfrastructure';
import queryprocess from './queryprocess';
import querygraph from './querygraph';

module.exports = {
  createGraphFromInfra,
  createGraphFromProcess,
  updateFlownodeProperty,
  updateITComponentProperty,
  addNodes,
  updateNeighborsBasedOnProps,
  updateComplianceNode
};

//final
function createGraphFromInfra(graph, infra) {
  let nodes = queryinfra.getNodes(infra);
  let sequences = queryinfra.getSequences(infra);

  removeModeltypeFromGraph(graph, 'infra'); // remove old process model in case of an update

  for (let i in nodes) {
    graph.add({
      group: "nodes",
      data: {id: nodes[i].id, name: nodes[i].name, props: nodes[i].props, nodetype: 'infra', modeltype: 'infra'}
    });
  }

  for (let i in sequences) {
    graph.add({group: "edges", data: {id: sequences[i].id, source: sequences[i].source, target: sequences[i].target}});
  }
}

//final
function createGraphFromProcess(graph, process) {
  let nodes = queryprocess.getFlowNodesOfProcess(process);
  let sequences = queryprocess.getSequenceFlowsofProcess(process);

  removeModeltypeFromGraph(graph, 'process'); // remove old process model in case of an update

  for (let i in nodes) {
    let node = nodes[i];
    let elementtype = node.$type.toLowerCase();

    if (!elementtype.includes('data')) { //only convert flownodes
      let props = queryprocess.getExtensionOfElement(node);
      let nodetype = 'businessprocess';

      for (let j in props) { //check if the node is a compliance process
        if (props[j].name == 'isComplianceProcess' && props[j].value == 'true') {
          nodetype = 'complianceprocess';
        }
      }

      graph.add({
        group: "nodes",
        data: {id: node.id, name: node.name, props: props, nodetype: nodetype, modeltype: 'process'}
      });
    }
  }

  for (let i in sequences) {
    graph.add({
      group: "edges",
      data: {id: sequences[i].id, source: sequences[i].sourceRef.id, target: sequences[i].targetRef.id}
    });
  }

}


//final
function removeModeltypeFromGraph(graph, modeltype) {
  let nodes = graph.nodes();
  let edges = graph.edges();
  let filter_nodes = [];
  let filter_edges = [];
  let edgeDublet = false;

  for (let i = 0; i < nodes.length; i++) { //get all affected nodes
    if (nodes[i].data('modeltype') == modeltype) {
      filter_nodes.push(nodes[i]);
    }
  }

  for (let i = 0; i < edges.length; i++) {
    for (let j = 0; j < filter_nodes.length; j++) { //based on the affected nodes determine affected edges
      if (edges[i].data('source') == filter_nodes[j].data('id') || edges[i].data('target') == filter_nodes[j].data('id')) {
        for (let k = 0; k < filter_edges.length; k++) {
          if (filter_edges[k] == edges[i]) {
            edgeDublet = true;
            break;
          }
        }
        if (edgeDublet) {
          edgeDublet = false;
        } else {
          filter_edges.push(edges[i]);
        }
      }
    }
  }

  for (let i = 0; i < filter_edges.length; i++) { //first remove edges
    filter_edges[i].remove();
  }

  for (let i = 0; i < filter_nodes.length; i++) { //second remove nodes
    filter_nodes[i].remove();
  }
}

//final
function updateFlownodeProperty(graph, flowelement) {
  let node = graph.getElementById(flowelement.id);
  let props = queryprocess.getExtensionOfElement(flowelement); //get extension props of flownode
  let nodetype = 'businessprocess';

  for (let j in props) { //check if the node is a compliance process
    if (props[j].name == 'isComplianceProcess' && props[j].value == 'true') {
      nodetype = 'complianceprocess';
    }
  }

  node.data('name', flowelement.name);
  node.data('nodetype', nodetype);
  node.data('props', props);
}

//final
function updateITComponentProperty(graph, element) {
  let node = graph.getElementById(element.id);
  let props = element.props;

  node.data('props', props);
}

//final
function updateNeighborsBasedOnProps(graph, element) { //
  let node = graph.getElementById(element.id);
  let props = node.data('props');
  let dir_pred = querygraph.getDirectPredecessor(node);
  let dir_suc = querygraph.getDirectSuccessor(node);
  let node_remove = [];
  let node_help;

  if (dir_pred.length > 0) {
    for (let i in dir_pred) {
      if (dir_pred[i].data('modeltype') != node.data('modeltype')) {
        node_help = dir_pred[i];
        for (let j in props) {
          if (props[j].value == dir_pred[i].id()) {
            node_help = null;
          }
        }
        if (node_help != null) {
          node_remove.push(node_help);
          node_help = null;
        }
      }
    }
  }

  if (node.data('nodetype') == 'complianceprocess' && dir_suc.length > 0) {
    for (let i in dir_suc) {
      if (dir_suc[i].data('modeltype') != node.data('modeltype')) {
        node_help = dir_suc[i];
        for (let j in props) {
          if (props[j].value == dir_suc[i].id()) {
            node_help = null;
          }
        }
        if (node_help != null) {
          node_remove.push(node_help);
          node_help = null;
        }
      }
    }
  }

  for (let i in node_remove) {
    let edge_remove;
    edge_remove = querygraph.getEdge(node, node_remove[i]); //1. determine Edge between
    edge_remove.remove(); // 2. delete edge

    if (node_remove[i].data('modeltype') == 'compliance') {
      removeComplianceNodes(node_remove[i]) // 3. perhaps delete compliance node
    }
  }
}

//final?
function updateComplianceNode(graph, flowelement) { //change edge direction in case of enable/disable a complianceprocess
  let node = graph.getElementById(flowelement.id);

  if (queryprocess.isCompliance(flowelement)) {
    let dir_pred = querygraph.getDirectPredecessor(node);

    for (let i in dir_pred) {
      if (dir_pred[i].data('modeltype') == 'compliance') {
        console.log('Compliance', dir_pred[i]);
        console.log('node', node);
        let edge = querygraph.getEdge(dir_pred[i], node);
        edge.remove();
        linkNodes(graph, node, dir_pred[i]);
      }
    }
  } else {
    let dir_suc = querygraph.getDirectSuccessor(node);

    for (let i in dir_suc) {
      if (dir_suc[i].data('modeltype') == 'compliance') {
        console.log(dir_suc[i]);
        let edge = querygraph.getEdge(node, dir_suc[i]);
        edge.remove();
        linkNodes(graph, dir_suc[i], node);
      }
    }
  }
}

//final
function removeComplianceNodes(node) { //only necessary for node of type 'compliance'
  let modeltype = node.data('modeltype');
  let successors = [];

  if (modeltype == 'compliance') {
    successors = querygraph.getDirectSuccessor(node);

    if (successors.length == 0) {
      let predecessors = node.predecessors().filter('node');
      let dir_predecessor = querygraph.getDirectPredecessor(node);

      for (let i = 0; i < dir_predecessor.length; i++) {
        let edge = querygraph.getEdge(dir_predecessor[i], node);
        edge.remove();
      }
      node.remove(); //initial node

      if (predecessors.length > 0) {
        removePred(predecessors);
      }
    }
  }
}

//todo: sometimes error because leaves[0] is undefined
function removePred(predecessors) {
  let leaves = predecessors.leaves('node');
  let node = leaves[0];
  let dir_succ = querygraph.getDirectSuccessor(node);

  if (dir_succ.length == 0) {
    let dir_pred = querygraph.getDirectPredecessor(node);
    if (dir_pred.length == 0) {
      node.remove();
    } else {
      let pred = node.predecessors().filter('node');

      for (let i = 0; i < dir_pred.length; i++) {
        let edge = querygraph.getEdge(dir_pred[i], node);
        edge.remove();
      }
      node.remove();
      removePred(pred);
    }
  }


}

function addNodes(graph, option) {
  let requirement = option.requirement;
  let requirement_2 = option.requirement_2;
  let flowelement = option.flowelement;
  let itcomponent = option.itcomponent;
  let source_node;
  let target_node;

  if (requirement != null && requirement_2 != null) { //link requirement-requirement
    source_node = addUniqueNode(graph, requirement);
    target_node = addUniqueNode(graph, requirement_2);
  }

  if (requirement != null && itcomponent != null) { //link requirement-itcomponent
    source_node = addUniqueNode(graph, requirement);
    target_node = graph.getElementById(itcomponent.id);
  }

  if (requirement != null && flowelement != null) { //link requirement-flowelement
    if (queryprocess.isCompliance(flowelement)) {
      source_node = graph.getElementById(flowelement.id);
      target_node = addUniqueNode(graph, requirement);
    } else {
      source_node = addUniqueNode(graph, requirement);
      target_node = graph.getElementById(flowelement.id);
    }
  }

  if (itcomponent != null && flowelement != null) { //link itcomponent-flowelement
    source_node = graph.getElementById(itcomponent.id);
    target_node = graph.getElementById(flowelement.id);
  }

  linkNodes(graph, source_node, target_node);
}

//final?
function addUniqueNode(graph, element) { //adds a single node to the graph if not available
  let nodes = graph.nodes();
  let isUnique = true;

  for (let i = 0; i < nodes.length; i++) { //determine whether an node with this id already exists
    if (nodes[i].id() == element.id) {
      isUnique = false;
      break;
    }
  }

  if (isUnique) {
    graph.add({
      group: "nodes",
      data: {
        id: element.id,
        text: element.text,
        title: element.title,
        props: element.source,
        nodetype: 'compliance',
        modeltype: 'compliance'
      }
    });
  }

  return graph.getElementById(element.id);
}

//final?
function linkNodes(graph, source, target) {
  let sequence_id = source.id() + '_' + target.id();
  console.log('source', source);
  console.log('target', target);
  console.log(sequence_id);

  graph.add({
    group: "edges",
    data: {id: sequence_id, source: source.id(), target: target.id()}
  });
}
