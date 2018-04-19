module.exports = {
  getElement,
  getProcess,
  getElementOfRegistry,
  getFlowElementsOfProcess,
  getFlowNodesOfProcess,
  getSequenceFlowsofProcess,
  getFlowElementById,
};

//final
function getElement(viewer, e) {
  return e.element;
}

function getDirectPredecessor(element) {

}

function getDirectSucessor(element) {

}

//Überladen, wenn eingabe einmal der Viewer und einmal ein Node ist??
function getProcess(viewer, e) {

  if (e == null) {
    let elementRegistry = viewer.get('elementRegistry');
    let nodes = [];
    nodes = elementRegistry.getAll();
    console.log(nodes.length);
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].businessObject.$type == 'bpmn:Process') {
        return nodes[i].businessObject;
      }
    }

  } else {
    let elementRegistry = viewer.get('elementRegistry');
    let nodeElement = elementRegistry.get(e.element.id);
    let node = nodeElement.businessObject;
    let process = elementRegistry.get(node.$parent.id);

    return process;
  }
}

//final
function getElementOfRegistry(viewer, id) {
  let elementRegistry = viewer.get('elementRegistry');
  let element = elementRegistry.get(id);

  return element.businessObject;
}

//final
function getFlowNodesOfProcess(process) {
  let flowElements = [];
  let nodes = [];

  flowElements = getFlowElementsOfProcess(process);

  for (let i = 0; i < flowElements.length; i++) {
    if (!flowElements[i].$type.includes('SequenceFlow')) {
      nodes.push(flowElements[i]);
    }
  }

  return nodes;
}

//final
function getSequenceFlowsofProcess(process) {
  let flowElements = [];
  let sequence = [];

  flowElements = getFlowElementsOfProcess(process);

  for (let i = 0; i < flowElements.length; i++) {
    if (flowElements[i].$type.includes('SequenceFlow')) {
      sequence.push(flowElements[i]);
    }
  }

  return sequence;
}

//final
function getFlowElementsOfProcess(process) {
  let flowElements = [];

  for (let i = 0; i < process.flowElements.length; i++) {
    flowElements.push(process.flowElements[i]);
  }

  return flowElements;
}

//final
function getFlowElementById(process, id) {
  let flowElements = [];
  flowElements = getFlowElementsOfProcess(process);

  for (let i = 0; i < flowElements.length; i++) {
    if (flowElements[i].id == id) {
      return flowElements[i];
    }
  }
  return null;
}
