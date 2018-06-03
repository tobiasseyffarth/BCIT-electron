module.exports = {
  getDirectPredecessor,
  getDirectSuccessor,
  getEdge,
  filterNodesByType,
  filterNodes,
  getNodesBetween,
  getLeavesOfType,
  getPredecessors,
  getSuccessors
};

//final
function getDirectPredecessor(node, nodetype) {
  let helper = [];
  helper = node.incomers();
  let predecessors = [];

  for (let i = 0; i < helper.length; i++) {
    if (helper[i].isNode()) {
      if (nodetype == null) {
        predecessors.push(helper[i]);
      }

      if (nodetype != null) {
        if (helper[i].data('nodetype') == nodetype) {
          predecessors.push(helper[i]);
        }
      }
    }
  }
  return predecessors;
}

function getDirectSuccessor(node, nodetype) {
  let helper = [];
  let successor = [];
  helper = node.outgoers();

  for (let i = 0; i < helper.length; i++) {
    if (helper[i].isNode()) {
      if (nodetype == null) {
        successor.push(helper[i]);
      }

      if (nodetype != null) {
        if (helper[i].data('nodetype') == nodetype) {
          successor.push(helper[i]);
        }
      }
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
  // let suc = node.successors().filter('node');
  let type;

  if (modeltype != null) {
    type = modeltype;
  } else {
    type = node.data('modeltype');
  }

  let suc = getSuccessors(node, type);

  if (suc.length == 0) {
    return node;
  }

  //check direct successor
  let dir_suc = getDirectSuccessor(node);
  let isLeave = false;
  for (let i = 0; i < dir_suc.length; i++) {
    if (dir_suc[i].data('modeltype') != type) {
      isLeave = true;
      break;
    }
  }

  if (isLeave) {
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


function getPredecessors(node, nodetype) {
  let dir_preds = getDirectPredecessor(node, nodetype);

  return getPredsOfType(dir_preds, nodetype, dir_preds);
}

function getPredsOfType(to_check, nodetype, preds) {
  let _tocheck = to_check;
  let new_check = [];

  for (let i = 0; i < _tocheck.length; i++) {
    let dir_pred = getDirectPredecessor(_tocheck[i], nodetype);

    for (let j = 0; j < dir_pred.length; j++) {
      preds.push(dir_pred[j]);
      new_check.push(dir_pred[j]);
    }
  }

  if (new_check.length > 0) {
    return getPredsOfType(new_check, nodetype, preds);
  } else {
    return uniqueArray(preds);
  }
}

function getSuccessors(node, nodetype) {
  let dir_sucs = getDirectSuccessor(node, nodetype);

  return getSucsOfType(dir_sucs, nodetype, dir_sucs);
}

function getSucsOfType(to_check, nodetype, sucs) {
  let _tocheck = to_check;
  let new_check = [];

  for (let i = 0; i < _tocheck.length; i++) {
    let dir_suc = getDirectSuccessor(_tocheck[i], nodetype);

    for (let j = 0; j < dir_suc.length; j++) {
      sucs.push(dir_suc[j]);
      new_check.push(dir_suc[j]);
    }
  }

  if (new_check.length > 0) {
    return getSucsOfType(new_check, nodetype, sucs);
  } else {
    return uniqueArray(sucs);
  }
}

//final
function uniqueArray(input) {
  let result = [];

  for (let i = 0; i < input.length; i++) {
    let el = input[i];
    let unique = true;

    for (let j = 0; j < result.length; j++) {
      let check = result[j];
      if (el == check) {
        unique = false;
        break;
      }
    }

    if (unique) {
      result.push(el);
    } else {
      unique = true;
    }
  }

  return result;
}
