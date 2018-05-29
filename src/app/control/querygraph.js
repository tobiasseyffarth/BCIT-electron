module.exports = {
  getDirectPredecessor,
  getDirectSuccessor,
  getEdge,
  filterNodesByType,
  filterNodes,
  getNodesBetween,
  getLeavesOfType
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
  let successor = [];
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

function filterNodes(eles) {
  let nodes = [];

  for (let i = 0; i < eles.length; i++) {
    if (eles[i].isNode()) {
      nodes.push(eles[i]);
    }
  }

  return nodes;
}

function getEdge(source, target) {
  let source_edge = source.connectedEdges();
  let target_edge = target.connectedEdges();

  for (let i = 0; i < source_edge.length; i++) {
    for (let j = 0; j < target_edge.length; j++) {
      if (source_edge[i] == target_edge[j]) {
        return source_edge[i];
      }
    }
  }
}

function getNodesBetween(source, target) {
  let succ = source.successors().filter('node');
  let pred = target.predecessors().filter('node');
  let nodes = [];

  for (let i = 0; i < succ.length; i++) {
    let node_suc = succ[i];
    for (let j = 0; j < pred.length; j++) {
      let node_pred = pred[j];
      if (node_suc == node_pred) {

        //avoid dublett
        let isUnique = true;
        for (let k = 0; k < nodes.length; k++) {
          if (node_suc == nodes[k]) {
            isUnique = false;
            break;
          }
        }

        if (isUnique) {
          nodes.push(node_suc);
        }
      }
    }
  }

  return nodes;
}

function getLeavesOfType(node, modeltype) {
  let leaves = [];
  let suc = node.successors().filter('node');
  let type;

  if (modeltype != null) {
    type = modeltype;
  } else {
    type = node.data('modeltype');
  }


  if (suc.length == 0) {
    return node;
  }

  //check direct successor
  let dir_suc=getDirectSuccessor(node);
  let isLeave=false;
  for(let i =0;i<dir_suc.length;i++){
    if(dir_suc[i].data('modeltype') != type){
      isLeave=true;
      break;
    }
  }

  if(isLeave){
    leaves.push(node);
  }

  //check successor
  for (let i = 0; i < suc.length; i++) {
    let node_check = suc[i];
    if (node_check.data('modeltype') == type) {
      let dir_suc = getDirectSuccessor(node_check);

      if (dir_suc.length == 0) {
        leaves.push(node_check);
      } else {
        for (let j = 0; j < dir_suc.length; j++) {
          if (dir_suc[j].data('modeltype') != type) {
            leaves.push(node_check);
          }
        }
      }
    }
  }

  return leaves;
}
