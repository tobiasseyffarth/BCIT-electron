module.exports = {
  getElement,
  getProcess,
  getElementOfRegistry,
  getFlowElementsOfProcess,
  getFlowNodesOfProcess,
  getSequenceFlowsofProcess,
  getFlowElementById,
  getExtensionOfElement,
  isCompliance,
  hasExtensionName,
  hasExtension,
  isUniqueExtension,
  isFlowElement,
  isDataObject,
  isExtensionShape,
  getIdFromExtensionShape,
  isDataObjectRef,
  isDataStore,
  isTaskOrSubprocess
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
    //console.log(nodes.length);
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
        for (let j in extensionElements[i].$children) {
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

//final
function isCompliance(element) {
  let name = 'isComplianceProcess';
  let value = 'true';

  return hasExtension(element, name, value);
}

//final
function hasExtensionName(element, name) {
  let props = getExtensionOfElement(element);
  for (let j in props) { //check if the element has an extension of name
    if (props[j].name == name) {
      return true
    }
  }
  return false;
}

function isExtensionShape(shape) {
  let element = shape.businessObject;
  return hasExtension(element, 'flowelement');
}

function hasExtension(element, name, value) {
  let props = getExtensionOfElement(element);

  if (value == undefined) {
    for (let j in props) { //check if the element has an extension of name
      if (props[j].name == name) {
        return true
      }
    }
  } else {
    for (let j in props) { //check if the node is a compliance process
      if (props[j].name == name && props[j].value == value) {
        return true
      }
    }
  }

  return false;
}

//final
function isFlowElement(option) { //identify flowNodes
  let element = option.element;
  let shape = option.shape;
  let type;

  if (element != null) {
    type = element.$type;
  }

  if (shape != null) {
    type = shape.type;
  }

  type = type.toLowerCase();

  if ((!type.includes('data')) && (!type.includes('sequence'))) {
    return true;
  } else {
    return false;
  }
}

//final
function isDataObject(option) { //identify Database or Document
  let element = option.element;
  let shape = option.shape;
  let type;

  if (element != null) {
    type = element.$type;
  }

  if (shape != null) {
    type = shape.type;
  }

  type = type.toLowerCase();

  if (type.includes('data')) {
    return true;
  } else {
    return false;
  }
}

function isDataStore(option) {
  let element = option.element;
  let shape = option.shape;
  let type;

  if (element != null) {
    type = element.$type;
  }

  if (shape != null) {
    type = shape.type;
  }

  type = type.toLowerCase();

  if (type.includes('datastore')) {
    return true;
  } else {
    return false;
  }
}

function isDataObjectRef(option) {
  let element = option.element;
  let shape = option.shape;
  let type;

  if (element != null) {
    type = element.$type;
  }

  if (shape != null) {
    type = shape.type;
  }

  type = type.toLowerCase();

  if (type.includes('dataobject')) {
    return true;
  } else {
    return false;
  }
}

//final
function isUniqueExtension(viewer, element, extension) {

  if (element.extensionElements == undefined) {
    return true;
  } else {
    let ext = element.extensionElements.get('values');
    for (let i = 0; i < ext.length; i++) {
      if (ext[i].name == extension.name && ext[i].value == extension.value) {
        return false;
        break;
      }
    }
  }
  return true;
}

//final
function getIdFromExtensionShape(shape) {
  let element = shape.businessObject;
  let shapeExtension = getExtensionOfElement(element);

  for (let j in shapeExtension) {
    let name = shapeExtension[j].name;
    let value = shapeExtension[j].value;
    if (name != 'flowelement') {
      return value;
    }
  }
}

function isTaskOrSubprocess(input){
  let element = input.element;
  let shape = input.shape;
  let type;

  if (element != null) {
    type = element.$type;
  }

  if (shape != null) {
    type = shape.type;
  }

  type = type.toLowerCase();

  if (type.includes('task')||type.includes('subprocess')) {
    return true;
  } else {
    return false;
  }
}
