import cytoscape from 'cytoscape';
import queryinfra from './queryInfrastructure';
import queryprocess from './queryprocess';

module.exports = {
  createGraphFromInfra,
  createGraphFromProcess,
  updateFlownodeProperty,
  updateITComponentProperty
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
function updateFlownodeProperty(graph, flownode){
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

function updateITComponentProperty(graph, element){
  let node = graph.getElementById(element.id);
  let props = element.props;

  node.data('props',props);
}

function createGraphFromCompliance() {

}

function addNodesToComplianceGraph(graph, source, target) {

}
