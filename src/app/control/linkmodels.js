// handle model linking (adding and removing elements)

import processrenderer from "./renderprocess";
import graphcontroller from "./creategraph";
import queryinfra from "./queryInfrastructure";
import queryprocess from "./queryprocess";
import processeditor from "./editprocess";

module.exports = {
  updateFlowelement,
  updateITComponent,
  linkRequirement2Requirement,
  linkRequirement2Infra,
  linkRequirement2Process,
  linkInfra2Process
};

function linkRequirement2Process(bpmnViewer, viewer, graph, flowelement, shape, requirement) {

  if (flowelement != null && requirement != null) {
    let extension = processeditor.createExtensionElement('compliance', requirement.id);
    let isUniqueExt = queryprocess.isUniqueExtension(viewer, flowelement, extension);

    if (isUniqueExt) {
      processeditor.addExtension(viewer, flowelement, extension); // 1. zu props flowelement hinzufügen
      bpmnViewer.renderProcessProps(); //2. processprops neu rendern
      graphcontroller.updateFlownodeProperty(graph, flowelement); // 3. graph in graphviewer updaten
      graphcontroller.addNodes(graph, {requirement: requirement, flowelement: flowelement}); // 4. create and link nodes
      processrenderer.addExtensionShape(viewer, shape, {compliance: requirement}, extension); // 5. add DataObject to process model
    }
  }
}

function linkInfra2Process(bpmnViewer, viewer, graph, flowelement, shape, itcomponent) {

  if (flowelement != null && itcomponent != null && !flowelement.$type.toLowerCase().includes('data')) {
    let extension = processeditor.createExtensionElement('infra', itcomponent.id);
    let isUniqueExt = queryprocess.isUniqueExtension(viewer, flowelement, extension);

    if (isUniqueExt) {
      processeditor.addExtension(viewer, flowelement, extension); // 1. zu props flowelement hinzufügen
      bpmnViewer.renderProcessProps(); //2. processprops neu rendern
      graphcontroller.updateFlownodeProperty(graph, flowelement); // 3. graph in graphviewer updaten
      graphcontroller.addNodes(graph, {itcomponent: itcomponent, flowelement: flowelement}); // 4. create and link nodes
      processrenderer.addExtensionShape(viewer, shape, {infra: itcomponent}, extension); // 5. add DataObject to process model
    }
  }

}

function linkRequirement2Requirement(graph, source_requirement, target_requirement) {
  graphcontroller.addNodes(graph, {requirement: source_requirement, requirement_2: target_requirement});
}

function linkRequirement2Infra(graph_viewer, infraViewer, requirement, itcomponent) {
  let graph_infra = infraViewer.graph;

  if (itcomponent != null) {
    let isUniqueProp = queryinfra.isUniqueProp(itcomponent, {requirement: requirement});
    if (isUniqueProp) { //if new Props are added
      queryinfra.updateITProps(itcomponent, {requirement: requirement});// 1. zu props infra hinzufügen
      graphcontroller.updateITComponentProperty(graph_infra, itcomponent);//2. Graph in infraviewer updaten
      infraViewer.renderITProps(); //3. infraprops neu rendern
      graphcontroller.updateITComponentProperty(graph_viewer, itcomponent); // 4. graph in graphviewer updaten
      graphcontroller.addNodes(graph_viewer, {requirement: requirement, itcomponent: itcomponent}); // 5. create and link nodes
      graphcontroller.updateITDisplayName(graph_viewer, graph_infra,itcomponent); // 6. update Displayname IT Component
    }
  }
}

function updateITComponent(graph, itcomponent) {
  let graph_viewer= graph.graph_viewer;
  let graph_infra= graph.graph_infra;

  graphcontroller.updateITComponentProperty(graph_viewer, itcomponent); // update node.data('props')
  graphcontroller.updateNeighborsBasedOnProps(graph_viewer, itcomponent); // remove edges
  graphcontroller.updateITDisplayName(graph_viewer, graph_infra,itcomponent); // update Displayname IT Component
}

function updateFlowelement(viewer, graph, flowelement) {
  graphcontroller.updateFlownodeProperty(graph, flowelement);
  graphcontroller.updateComplianceNode(graph, flowelement);
  graphcontroller.updateNeighborsBasedOnProps(graph, flowelement);
  processrenderer.removeExtensionShape(viewer, flowelement);
}
