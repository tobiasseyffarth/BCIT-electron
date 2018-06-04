import cytoscape from "cytoscape";
import querygraph from "./querygraph";
import creategraph from "./creategraph";

module.exports = {
  replaceITDirect,
  replaceITTransitive,
  deleteITObsolete,
  deleteITViolation,
  deleteComplianceProcessViolation,
  deleteComplianceProcessObsolete,
  deleteComplianceObsolete,
  deleteActivityObsolte,
  replaceComplianceProcessDirect,
  replaceProcessTransitive,
  replaceComplianceDirect,
  replaceComplianceTransitive,
  replaceActivityDirect
};

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
        creategraph.addUniqueNode(result_graph, {node: node}, 'between');
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
            creategraph.addUniqueNode(result_graph, {node: leave}, 'between'); //push IT predecessor of business activity
            creategraph.addUniqueNode(result_graph, {node: help_node}, 'between'); //push business activity
            creategraph.addUniqueNode(result_graph, {node: help_pred}, 'indirectdemand'); //push compliance of business activity
            addNodesBetween(_node, leave, result_graph); //add nodes between change element and IT predecessor of business activity

            let compliance_pred = querygraph.getPredecessors(help_pred, 'compliance'); //get predecessor of compliance of business activity
            for (let l = 0; l < compliance_pred.length; l++) {
              creategraph.addUniqueNode(result_graph, {node: compliance_pred[l]}, 'indirectdemand');
            }
          }
        }
      } else if (help_node.data('nodetype') == 'complianceprocess') { //get compliance of compliance process
        let help_sucs = querygraph.getDirectSuccessor(help_node);

        for (let k = 0; k < help_sucs.length; k++) {
          let help_suc_node = help_sucs[k];

          creategraph.addUniqueNode(result_graph, {node: leave}, 'between'); //push IT predecessor of compliance process
          creategraph.addUniqueNode(result_graph, {node: help_node}, 'between'); //push compliance process

          let node_between = querygraph.getNodesBetween(_node, leave); //add nodes between change element and IT predecessor of business activity
          for (let l = 0; l < node_between.length; l++) {
            creategraph.addUniqueNode(result_graph, {node: node_between[l]}, 'between');
          }

          if (help_suc_node.data('modeltype') == 'compliance') {
            creategraph.addUniqueNode(result_graph, {node: help_suc_node}, 'indirectdemand'); //push compliance of compliance process

            //  let compliance_pred = help_suc_node.predecessors().filter('node[modeltype = "compliance"]'); //get predecessor of compliance of compliance process
            let compliance_pred = querygraph.getPredecessors(help_suc_node, 'compliance'); //get predecessor of compliance of business activity
            for (let l = 0; l < compliance_pred.length; l++) {
              creategraph.addUniqueNode(result_graph, {node: compliance_pred[l]}, 'indirectdemand');
            }
          }
        }
      }
    }
  }

  // get indirect demands by compliance of succeeding IT components
  let IT_suc = querygraph.getSuccessors(_node, 'infra'); //get predecessor of compliance of business activity

  for (let i = 0; i < IT_suc.length; i++) {
    let IT_component = IT_suc[i];
    let dir_IT_pred = querygraph.getDirectPredecessor(IT_component);

    for (let j = 0; j < dir_IT_pred.length; j++) {
      let help_node = dir_IT_pred[j];

      if (help_node.data('modeltype') == 'compliance') {
        creategraph.addUniqueNode(result_graph, {node: IT_component}, 'between'); // add IT component

        let node_between = querygraph.getNodesBetween(_node, IT_component); //add nodes between change element and IT
        for (let l = 0; l < node_between.length; l++) {
          creategraph.addUniqueNode(result_graph, {node: node_between[l]}, 'between');
        }

        creategraph.addUniqueNode(result_graph, {node: help_node}, 'indirectdemand'); // add compliance (=pred of IT component)

        let compliance_pred = querygraph.getPredecessors(help_node, 'compliance'); //get predecessor of compliance of business activity
        for (let l = 0; l < compliance_pred.length; l++) { //add predecessor of compliance of IT component
          creategraph.addUniqueNode(result_graph, {node: compliance_pred[l]}, 'indirectdemand');
        }
      }
    }
  }

  creategraph.createEdges(graph, result_graph, 'indirect'); //create Edges
}

//final -// Remove IT - Obsolete
function deleteITObsolete(graph, node, result_graph) {
  let _node = node;
  let IT_suc = querygraph.getSuccessors(_node, 'infra');

  //check obsolete compliance of succeding IT
  for (let i = 0; i < IT_suc.length; i++) {
    let IT_component = IT_suc[i];
    let dir_IT_pred = querygraph.getDirectPredecessor(IT_component);

    for (let j = 0; j < dir_IT_pred.length; j++) {
      let help_node = dir_IT_pred[j];

      if (help_node.data('modeltype') == 'compliance') {
        let addNode = containNoOtherNode(querygraph.getDirectSuccessor(help_node), IT_suc);

        if (addNode) { // if compliance has more than one successor, dont remove it
          creategraph.addUniqueNode(result_graph, {node: IT_component}, 'between'); // add IT component
          creategraph.addUniqueNode(result_graph, {node: help_node}, 'obsolete'); // add compliance (=pred of IT component)
          addNodesBetween(_node, IT_component, result_graph); //add nodes between change element and IT
          deleteComplianceObsolete(graph, help_node, result_graph); //check obsolete compliance and add them to result graph
        }
      }
    }
  }
  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges

  //todo: check obsolete compliance of precedings IT
  let pred_IT = querygraph.getPredecessors(_node, 'infra');


  //check obsolete Compliance of node
  let dir_pred = querygraph.getDirectPredecessor(_node);

  for (let i = 0; i < dir_pred.length; i++) {
    let help_node = dir_pred[i];

    if (help_node.data('modeltype') == 'compliance') {
      if (querygraph.getDirectSuccessor(help_node).length == 1) { // if compliance has more than one successor, dont remove it

        creategraph.addUniqueNode(result_graph, {node: help_node}, 'obsolete'); // add compliance (=pred of IT component)

        let compliance_preds = querygraph.getPredecessors(help_node, 'compliance');

        for (let k = 0; k < compliance_preds.length; k++) {
          let compliance_pred = compliance_preds[k];

          if (querygraph.getDirectSuccessor(compliance_pred).length == 1) { //if compliance has no other successor
            creategraph.addUniqueNode(result_graph, {node: compliance_pred}, 'obsolete'); // add pred of compliance
          }
        }
      }
    }
  }

  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges
}

//final - // Remove IT - Violation
function deleteITViolation(graph, node, result_graph) {
  let _node = node;
  let leaves = querygraph.getLeavesOfType(_node); // get leaves of IT component

  for (let i = 0; i < leaves.length; i++) {
    let leave = leaves[i]; //IT component
    let dir_leave_sucs = querygraph.getDirectSuccessor(leave); // get direct suc of leave

    for (let j = 0; j < dir_leave_sucs.length; j++) {
      let help_node = dir_leave_sucs[j];

      if (help_node.data('nodetype') == 'complianceprocess') {
        let help_sucs = querygraph.getDirectSuccessor(help_node);

        creategraph.addUniqueNode(result_graph, {node: leave}, 'between'); //push IT predecessor of compliance process
        creategraph.addUniqueNode(result_graph, {node: help_node}, 'violated'); //push compliance process
        addNodesBetween(_node, leave, result_graph); //add nodes between change element and IT predecessor of complianceprocess

        for (let k = 0; k < help_sucs.length; k++) {
          let help_suc_node = help_sucs[k];

          if (help_suc_node.data('modeltype') == 'compliance') {
            creategraph.addUniqueNode(result_graph, {node: help_suc_node}, 'violated'); //push compliance of compliance process

            let compliance_pred = querygraph.getPredecessors(help_suc_node, 'compliance'); //get predecessor of compliance of compliance process

            for (let l = 0; l < compliance_pred.length; l++) {
              creategraph.addUniqueNode(result_graph, {node: compliance_pred[l]}, 'violated');
            }
          }
        }
      }
    }
  }
  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges
}

//final
function deleteComplianceProcessViolation(graph, node, result_graph) {
  let _node = node;
  let dir_compliance_sucs = querygraph.getDirectSuccessor(_node);

  for (let i = 0; i < dir_compliance_sucs.length; i++) {
    let dir_suc = dir_compliance_sucs[i];

    if (dir_suc.data('nodetype') === 'compliance') {
      creategraph.addUniqueNode(result_graph, {node: dir_suc}, 'violated');

      let compliance_preds = querygraph.getPredecessors(dir_suc, 'compliance');

      for (let j = 0; j < compliance_preds.length; j++) {
        let compliance_pred = compliance_preds[j];
        creategraph.addUniqueNode(result_graph, {node: compliance_pred}, 'violated');
      }
    }
  }
  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges

// Suc anschauen, wenn Compliance
  // -> Compliance violated, Vörgänger der Compliance ebenfalls violated
}

//final?
function deleteComplianceProcessObsolete(graph, node, result_graph) {
  let _node = node;
  let dir_preds = querygraph.getDirectPredecessor(_node);

  for (let i = 0; i < dir_preds.length; i++) {
    let dir_pred = dir_preds[i];

    if (dir_pred.data('nodetype') === 'infra') {
      let infra = dir_pred;
      let dir_infra_sucs = querygraph.getDirectSuccessor(infra);
      let obsolete_infra = []; //save obsolete IT components

      if (dir_infra_sucs.length === 1) { // infra only supports the compliance process (=_node)
        obsolete_infra.push(infra);

        let infra_preds = querygraph.getPredecessors(infra, 'infra');

        for (let j = 0; infra_preds.length; j++) {
          let infra_helper = infra_preds[j];

          if (querygraph.getDirectSuccessor(infra_helper).length === 1) { //get all obsolete IT components
            obsolete_infra.push(infra_helper);
          } else {
            break;
          }
        }

        for (let j = 0; j < obsolete_infra.length; j++) {
          let infra = obsolete_infra[j];
          let compliance_preds = querygraph.getPredecessors(infra, 'compliance');

          for (let k = 0; k < compliance_preds.length; k++) {
            let compliance_pred = compliance_preds[k];

            //todo: hier die direkten Vorgänger !=compliance anschauen und gegen obsolete_infras pruefen
            let dir_comp_sucs = querygraph.getDirectSuccessor(compliance_pred);
            let addNode = true;
            for (let l = 0; l < dir_comp_sucs.length; l++) {
              if (dir_comp_sucs[l].data('nodetype') != 'compliance') {
                addNode = containNoOtherNode(dir_comp_sucs[l], obsolete_infra);
                if (!addNode) {
                  break;
                }
              }
            }

            if (addNode) {
              let compliance_leafes = querygraph.getLeavesOfType(compliance_pred);

              for (let l = 0; l < compliance_leafes.length; l++) {
                let compliance_leafe = compliance_leafes[l];
                let addNode_2 = containNoOtherNode(querygraph.getDirectSuccessor(compliance_leafe), obsolete_infra);

                if (addNode_2) {
                  creategraph.addUniqueNode(result_graph, {node: infra}, 'between'); //infra
                  creategraph.addUniqueNode(result_graph, {node: compliance_pred}, 'obsolete');  // compliance_pred
                  creategraph.addUniqueNode(result_graph, {node: compliance_leafe}, 'obsolete'); //compliance_leafe

                  let nodes_between = querygraph.getNodesBetween(compliance_pred, compliance_leafe);  // between leafe und compliance_pred
                  for (let m = 0; j < nodes_between.length; m++) {
                    let node_between = nodes_between[m];
                    creategraph.addUniqueNode(result_graph, {node: node_between}, 'obsolete');
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges


  //wenn Vörgänger = IT
  //IT wird durch Compliance bestimmt und IT erbringt nur diese IT --> Compliance ist obsolete
}

//final
function containNoOtherNode(to_check, node_list) {
  //node_list: gegen diese Liste wird gecheckt
  // to_check: zu checkende Liste
  if (to_check.length > node_list) {
    return false;
  }

  for (let i = 0; i < to_check.length; i++) {
    let check_node = to_check[i];
    let result = false;

    for (let j = 0; j < node_list.length; j++) {
      let list_node = node_list[j];
      if (check_node == list_node) {
        result = true;
      }
    }

    if (!result) {
      return false;
      break;
    }
  }
  return true;
}

//final?
function replaceComplianceProcessDirect(graph, node, result_graph) {
  let _node = node;
  let dir_compliance_sucs = querygraph.getDirectSuccessor(_node, 'compliance'); //get compliance requirements of compliance process

  for (let i = 0; i < dir_compliance_sucs.length; i++) {
    let dir_suc = dir_compliance_sucs[i];

    creategraph.addUniqueNode(result_graph, {node: dir_suc}, 'directdemand');

    let compliance_preds = querygraph.getPredecessors(dir_suc, 'compliance');

    for (let j = 0; j < compliance_preds.length; j++) { // check also preds of compliance
      let compliance_pred = compliance_preds[j];
      creategraph.addUniqueNode(result_graph, {node: compliance_pred}, 'directdemand');
    }
  }
  creategraph.createEdges(graph, result_graph, 'direct');
}

//final?
function replaceProcessTransitive(graph, node, result_graph) {
  let _node = node;
  let IT_preds = querygraph.getPredecessors(_node, 'infra');

  for (let i = 0; i < IT_preds.length; i++) {
    let IT_component = IT_preds[i];

    let compliance_preds = querygraph.getPredecessors(IT_component, 'compliance');
    for (let j = 0; j < compliance_preds.length; j++) {
      let compliance = compliance_preds[j];

      creategraph.addUniqueNode(result_graph, {node: IT_component}, 'between');
      creategraph.addUniqueNode(result_graph, {node: compliance}, 'indirectdemand');
      addNodesBetween(IT_component, _node, result_graph);
    }
  }

  creategraph.createEdges(graph, result_graph, 'indirect');
}

//final?
function deleteComplianceObsolete(graph, node, result_graph) {
  let _node = node;
  let obsolete_compliance = [];
  obsolete_compliance.push(_node);

  //consider successors
  let sucs = querygraph.getSuccessors(_node, 'compliance');

  for (let i = 0; i < sucs.length; i++) {
    let compliance = sucs[i];
    let check = false;
    let dir_preds = querygraph.getDirectPredecessor(compliance, 'compliance');
    check = containNoOtherNode(dir_preds, obsolete_compliance);

    if (check) {
      obsolete_compliance.push(compliance);
      creategraph.addUniqueNode(result_graph, {node: compliance}, 'obsolete');
    }
  }

  //consider predecessors
  let preds = querygraph.getPredecessors(_node, 'compliance');
  for (let i = 0; i < preds.length; i++) {
    let compliance = preds[i];
    let check = false;
    let dir_sucs = querygraph.getDirectSuccessor(compliance);
    check = containNoOtherNode(dir_sucs, obsolete_compliance);

    if (check) {
      obsolete_compliance.push(compliance);
      creategraph.addUniqueNode(result_graph, {node: compliance}, 'obsolete');
    }
  }

  //consider compliance-Processes
  for (let i = 0; i < obsolete_compliance.length; i++) {
    let compliance = obsolete_compliance[i];
    let compliance_processes = querygraph.getDirectPredecessor(compliance, 'complianceprocess');

    for (let j = 0; j < compliance_processes.length; j++) {
      let cp = compliance_processes[j];
      let dir_suc = querygraph.getDirectSuccessor(cp, 'compliance');
      let addCP = containNoOtherNode(dir_suc, obsolete_compliance);

      if (addCP) {
        creategraph.addUniqueNode(result_graph, {node: cp}, 'obsolete');
      }
    }
  }

  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges
}

//final
function replaceComplianceDirect(graph, node, result_graph) {
  // all predesessors set direct demands
  let _node = node;
  let compliance_preds = querygraph.getPredecessors(_node, 'compliance');

  for (let i = 0; i < compliance_preds.length; i++) {
    let compliance_pred = compliance_preds[i];
    creategraph.addUniqueNode(result_graph, {node: compliance_pred}, 'directdemand');
  }

  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges
}

//final
function replaceComplianceTransitive(graph, node, result_graph) {
  let _node = node;
  let comp_sucs = querygraph.getSuccessors(_node, 'compliance');

  for (let i = 0; i < comp_sucs.length; i++) {
    let compliance_suc = comp_sucs[i];
    creategraph.addUniqueNode(result_graph, {node: compliance_suc}, 'indirectdemand');

    //add compliance process of comp_sucs to result
    let cp = querygraph.getDirectPredecessor(compliance_suc, 'complianceprocess');
    for (let j = 0; j < cp.length; j++) {
      creategraph.addUniqueNode(result_graph, {node: cp[j]}, 'indirectdemand');
    }
  }

  //add compliance process of _node
  let cp = querygraph.getDirectPredecessor(_node, 'complianceprocess');
  for (let j = 0; j < cp.length; j++) {
    creategraph.addUniqueNode(result_graph, {node: cp[j]}, 'indirectdemand');
  }

  creategraph.createEdges(graph, result_graph, 'indirect'); //create Edges
}

//final
function replaceActivityDirect(graph, node, result_graph) {
  let _node = node;

  //add all compliance predecessors
  let preds=querygraph.getPredecessors(_node, 'compliance');
  for(let i =0;i<preds.length;i++){
    let compliance=preds[i];
    creategraph.addUniqueNode(result_graph, {node: compliance}, 'directdemand');
  }

  //add compliance processes of direct preceding requirements
  let dir_comp_preds = querygraph.getDirectPredecessor(_node, 'compliance');

  for (let i = 0; i < dir_comp_preds.length; i++) {
    let compliance = dir_comp_preds[i];
    let compliance_processes = querygraph.getDirectPredecessor(compliance, 'complianceprocess');

    for (let j = 0; j < compliance_processes.length; j++) {
      let cp = compliance_processes[j];
      creategraph.addUniqueNode(result_graph, {node: cp}, 'directdemand');
    }
  }
  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges
}

//final
function deleteActivityObsolte(graph, node, result_graph) {
  let _node = node;

  //consider compliance requirements of business process
  let dir_comp = querygraph.getDirectPredecessor(_node, 'compliance'); //get all compliance req.

  for (let i = 0; i < dir_comp.length; i++) {
    let compliance = dir_comp[i];

    if (querygraph.getDirectSuccessor(compliance).length === 1) {
      creategraph.addUniqueNode(result_graph, {node: compliance}, 'obsolete');
      deleteComplianceObsolete(graph, compliance, result_graph); //get further obsolete compliance requirements
    }
  }

  //consider compliance requirements of IT components --> if IT component supports only business activity
  let it_components = querygraph.getDirectPredecessor(_node, 'infra');
  for(let i=0; i<it_components.length;i++){
    let it_component=it_components[i];

    if(querygraph.getDirectSuccessor(it_component).length===1){
      creategraph.addUniqueNode(result_graph, {node: it_component}, 'obsolete');
      deleteITObsolete(graph, it_component, result_graph); //get obsolete compliance requirements
    }
  }

  creategraph.createEdges(graph, result_graph, 'direct'); //create Edges
}

//final
function addNodesBetween(source, target, result_graph) {
  let nodes_between = querygraph.getNodesBetween(source, target);
  for (let k = 0; k < nodes_between.length; k++) {
    let node = nodes_between[k];
    creategraph.addUniqueNode(result_graph, {node: node}, 'between');
  }
}
