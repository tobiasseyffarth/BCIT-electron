import cytoscape from 'cytoscape';
import queryinfra from './queryInfrastructure';
import queryprocess from './queryprocess';

module.exports = {
  createGraphFromInfra, createGraphFromProcess
};


//final
function createGraphFromInfra(graph, infra) {
  let nodes = queryinfra.getNodes(infra);
  let sequences = queryinfra.getSequences(infra);

  for (let i in nodes) {
    graph.add({group: "nodes", data: {id: nodes[i].id, name: nodes[i].name, props: nodes[i].props, type: 'infra'}});
  }

  for (let i in sequences) {
    graph.add({group: "edges", data: {id: sequences[i].id, source: sequences[i].source, target: sequences[i].target}});
  }
}

//final
function createGraphFromProcess(graph, process) {
  let nodes = queryprocess.getFlowNodesOfProcess(process);
  let sequences = queryprocess.getSequenceFlowsofProcess(process);

  for(let i in nodes){
    graph.add({group: "nodes", data: {id: nodes[i].id, name: nodes[i].name, type: 'businessprocess'}}); //todo: hier die Erweiterung auf Compliance abgreifen und den Knotentyp anpassen
  }

  for(let i in sequences){
    graph.add({group: "edges", data: {id: sequences[i].id, source: sequences[i].sourceRef.id, target: sequences[i].targetRef.id}});
  }
}

function createGraphFromCompliance() {

}

function addNodesToComplianceGraph(graph, source, target) {

}
