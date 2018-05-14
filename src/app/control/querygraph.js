module.exports = {
  getDirectPredecessor,
  getDirectSuccessor,
  getEdge,
  filterNodesByType,
  filterNodes
}

//final
function getDirectPredecessor(node) {
  let helper = [];
  let predecessors = [];
  helper = node.incomers();

  for (let i = 0; i < helper.length; i++) {
    if (helper[i].isNode()) {
      predecessors.push(helper[i]);
    }
  }
  return predecessors;
}

function getDirectSuccessor(node) {
  let helper = [];
  let successor= [];
  helper = node.outgoers();

  for (let i = 0; i < helper.length; i++) {
    if (helper[i].isNode()) {
      successor.push(helper[i]);
    }
  }
  return successor;
}

function filterNodesByType(nodes, type) {
  let result = [];

  for (let i in nodes) {
    if (nodes[i].data('nodetype') == type) {
      result.push(nodes[i]);
    }
  }
  return result;
}

function filterNodes(eles){
  let nodes=[];

  for (let i = 0; i < eles.length; i++) {
    if (eles[i].isNode()) {
      nodes.push(eles[i]);
    }
  }

  return nodes;
}

function getEdge(source, target) {
  let source_edge=source.connectedEdges();
  let target_edge=target.connectedEdges();

  for(let i=0;i< source_edge.length; i++){
    for(let j=0;j<target_edge.length; j++){
      if(source_edge[i]==target_edge[j]){
        return source_edge[i];
      }
    }
  }
}
