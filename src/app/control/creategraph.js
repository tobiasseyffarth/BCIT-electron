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
  updateNeighborsBasedOnProps
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

  for (let i = 0; i < nodes.length; i++) { //get all affected nodes
    if (nodes[i].data('modeltype') == modeltype) {
      filter_nodes.push(nodes[i]);
    }
  }

  for (let i = 0; i < edges.length; i++) {
    for (let j = 0; j < filter_nodes.length; j++) { //based on the affected nodes determine affected edges
      if (edges[i].data('source') == filter_nodes[j].data('id') || edges[i].data('target') == filter_nodes[j].data('id')) {
        filter_edges.push(edges[i]);
      }
    }
  }

  for (let i = 0; i < filter_edges.length; i++) { //first remove edges
    //console.log(filter_edges[i]);
    graph.remove(filter_edges[i]);
  }

  for (let i = 0; i < filter_nodes.length; i++) { //second remove nodes
    //console.log(filter_nodes[i]);
    graph.remove(filter_nodes[i]);
  }
}

//final
function updateFlownodeProperty(graph, flownode) {
  let node = graph.getElementById(flownode.id);

  let props = queryprocess.getExtensionOfElement(flownode); //get extension props of flownode
  let nodetype = 'businessprocess';

  for (let j in props) { //check if the node is a compliance process
    if (props[j].name == 'isComplianceProcess' && props[j].value == 'true') {
      nodetype = 'complianceprocess';
    }
  }

  node.data('name', flownode.name);
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
  let node_remove;

  if (dir_pred.length > 0) {  // check if pred of type compliance
    for (let i in dir_pred) {
      node_remove = dir_pred[i];
      for (let j in props) {
        if (props[j].value == dir_pred[i].id()) {
          node_remove = null;
        }
      }
    }

    if (node_remove != null) {
      let edge_remove;
      edge_remove = querygraph.getEdge(node, node_remove); //1. determinde Edge between
      edge_remove.remove(); // 2. delete edge

      if (node_remove.data('modeltype') == 'compliance') {
        removeNodes(node_remove) // 3. perhaps delete compliance node
      }
    }
  }
}

//final
function removeNodes(node) { //only necessary for node of type 'compliance'
  let modeltype = node.data('modeltype');
  let successors = [];

  if (modeltype == 'compliance') {
    successors = querygraph.getDirectSuccessor(node);

    if (successors.length == 0) {
      let predecessors = node.predecessors().filter('node');
      let dir_predecessor = querygraph.getDirectPredecessor(node);

      if (predecessors.length > 0) {
        for (let i = 0; i < dir_predecessor.length; i++) {
          let edge = querygraph.getEdge(dir_predecessor[i], node);
          edge.remove();
        }
        node.remove(); //initial node
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
  let source_requirement = option.source_requirement;
  let target_requirement = option.target_requirement;
  let target_flowelement = option.target_flowelement;
  let source_itcomponent = option.source_itcomponent;
  let target_itcomponent = option.target_itcomponent;

  if (source_requirement != null && target_requirement != null) { //link requirement-requirement
    addUniqueNode(graph, source_requirement);
    addUniqueNode(graph, target_requirement);
    linkNodes(graph, source_requirement, target_requirement);
  }

  if (source_requirement != null && target_itcomponent != null) { //link requirement-itcomponent
    addUniqueNode(graph, source_requirement);
    linkNodes(graph, source_requirement, target_itcomponent);
  }
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
}

//final?
function linkNodes(graph, source, target) {
  let sequence_id = source.id + '_' + target.id;

  graph.add({
    group: "edges",
    data: {id: sequence_id, source: source.id, target: target.id}
  });

}
