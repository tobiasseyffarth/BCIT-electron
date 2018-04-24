import BpmnModdle from 'bpmn-moddle';

module.exports = {
  addElements, definition2xml, addExtension, defineAsComplianceProcess
};

function updateProperty_a(element) {
  element.name = "test"; //Element = Moodle-Element
}

//todo: geht nicht: Quelle: https://github.com/bpmn-io/bpmn-js/issues/430
function updateProperty_b(viewer, element) {
  let modeling = viewer.get('modeling');
  modeling.updateProperties(element, {id: 'neue_id'});
}


//geht nicht
function colorElement(element) {

  var overlays = this.viewer.get('overlays');
  //var elementRegistry = viewer.get('elementRegistry');

  //var shape = elementRegistry.get('UserTask_1');

  var $overlayHtml =
    $('<div class="highlight-overlay">')
      .css({
        width: element.width,
        height: element.height
      });

  overlays.add(element.id, {
    position: {
      top: -5,
      left: -5
    },
    html: $overlayHtml
  });

}


//toDo: weitere Ideen
/*
die Methoden zum "Programmieren" eines Prozesses anschauen.
 */


//final
function addElements(viewer, process) {

  //https://github.com/bpmn-io/bpmn-moddle/blob/master/test/spec/xml/edit.js
  //https://github.com/bpmn-io/bpmn-moddle/blob/master/test/spec/xml/write.js
  var moddle = viewer.get('moddle'); // Moddle verändert das Datenmodell
  var dataObject = moddle.create('bpmn:DataObject', {id: 'dataObject_2'}); // mit moddle.create können beliebige BPMN-Objekte erzeugt werden
  let database = moddle.create('bpmn:DataStore', {id: 'dataStore_2'});

  let task = moddle.create('bpmn:Task', {id: 'task_2', name: 'name'});

  // neue Objekte müssen an das Parent-Element gehangen werden

  task.dataObjectRef = dataObject;
  task.dataStoreRef = database;

  task.$parent = process;
  dataObject.$parent = process;
  database.$parent = process;

  process.flowElements.push(task);
  process.flowElements.push(dataObject);
  process.flowElements.push(database);

}


function addExtension(viewer, element, extension) {
  let moddle = viewer.get('moddle'); // Moddle verändert das Datenmodell
  //let moddle = new BpmnModdle();
  let extensionElements = moddle.create('bpmn:ExtensionElements'); //moddle.create('bpmn:DataObject', {id: 'dataObject_2'}); // mit moddle.create können beliebige BPMN-Objekte erzeugt werden

  // let ext = createExtensionElement('infra', '12344');
  // let ext2 = createExtensionElement('source', '12344');
  // let ext3 = createExtensionElement('comp', '12344');

  if (element.extensionElements == undefined) { //todo: bestehende Extension updaten
    element.extensionElements = extensionElements;
  }

  // element.extensionElements.get('values').push(ext);
  // element.extensionElements.get('values').push(ext2);
  // element.extensionElements.get('values').push(ext3);
  element.extensionElements.get('values').push(extension);
}

//final
function createExtensionElement(name, value) {
  let moddle = new BpmnModdle();

  let extension = moddle.createAny('vendor:foo', 'http://vendor', {
    name: name,
    value: value
  });
  return extension;
}

//final
function removeExtensionElement(extensionElements, name, value) {
  let ext = extensionElements.get('values');

  for (let i in ext) {
    if (ext[i].name == name && ext[i].value == value) {
      ext.splice(i, 1);
      break;
    }
  }
}

//final
function defineAsComplianceProcess(viewer, element, status) {
  if (status == true) { //if element shall be set as a compliance process
    let extension = createExtensionElement('isComplianceProcess', 'true');
    addExtension(viewer, element, extension);
  } else { //undo a seted compliance process
    removeExtensionElement(element.extensionElements, 'isComplianceProcess', 'true');
  }
}

//final
function definition2xml(definitions) {
  let moddle = new BpmnModdle();
  let xml;
  moddle.toXML(definitions, function (err, xmlStrUpdated) {

    xml = xmlStrUpdated;
    console.log(xml);

  });


}
