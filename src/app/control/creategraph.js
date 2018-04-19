import cytoscape from 'cytoscape';
import queryinfra from './queryInfrastructure';

module.exports = {
  createGraphFromInfra, createGraphFromProcess
};

function createGraphFromInfra(graph, infra) {
  let nodes = queryinfra.getNodes(infra);
  let sequences = queryinfra.getSequences(infra);

  /*
  console.log('graph erstellen');
  console.log('Anzahl Nodes: ', nodes.length);
  console.log('Anzahl Edge: ', sequences.length);
*/
  for (let i in nodes) {
    graph.add({group: "nodes", data: {id: nodes[i].id, name: nodes[i].name}});
    //console.log('node', nodes[i].id);
  }

  for (let i in sequences) {
    graph.add({group: "edges", data: {id: sequences[i].id, source: sequences[i].source, target: sequences[i].target}});
    /*
      console.log('source', sequences[i].source);
      console.log('target', sequences[i].target);
      */
  }
}

function createGraphFromProcess(process) {

}
