module.exports = {
  getElement,
  getProcess,
  getElementOfRegistry,
  getFlowElementsOfProcess,
  getFlowNodesOfProcess,
  getSequenceFlowsofProcess,
  getFlowElementById,
  getExtensionOfElement,
  isCompliance
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

//final
function getExtensionOfElement(element) {
  let extensionElements = [];
  let result = [];
  let name;
  let value;

  if (element.extensionElements != undefined) {

    extensionElements = element.extensionElements.values;

    for (let i in extensionElements) {
      if (extensionElements[i].$children != undefined) { //get camunda extension
        console.log('camunda extension');
        console.log(extensionElements[i]);
        for(let j in extensionElements[i].$children){
          name = extensionElements[i].$children[j].name;
          value = extensionElements[i].$children[j].value;
          result.push({name: name, value: value});
        }
      } else { //get own extension
        name = extensionElements[i].name;
        value = extensionElements[i].value;
        result.push({name: name, value: value});
      }
    }

    return result;
  }
}

function isCompliance(element){
  let props = getExtensionOfElement(element);

  for (let j in props) { //check if the node is a compliance process
    if (props[j].name == 'isComplianceProcess' && props[j].value == 'true') {
      return true
    }
  }
  return false;
}
