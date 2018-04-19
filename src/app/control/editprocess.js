module.exports = {
  addElements
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
function addElements(viewer, process){

  //https://github.com/bpmn-io/bpmn-moddle/blob/master/test/spec/xml/edit.js
  //https://github.com/bpmn-io/bpmn-moddle/blob/master/test/spec/xml/write.js
  var moddle = viewer.get('moddle'); // Moddle verändert das Datenmodell
  var dataObject_2 = moddle.create('bpmn:DataObject', {id: 'dataObject_2'}); // mit moddle.create können beliebige BPMN-Objekte erzeugt werden
  let task = moddle.create('bpmn:Task', {id: 'task_2', name: 'name'});
  console.log(dataObject_2);
  console.log(task);
  console.log(process.flowElements.length);
  console.log(process.flowElements);

  process.flowElements.push(task); // neue Objekte müssen an das Parent-Element gehangen werden

  console.log(process.flowElements.length);
  console.log(process.flowElements);

}
