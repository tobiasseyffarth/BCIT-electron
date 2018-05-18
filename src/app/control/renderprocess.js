import queryprocess from "./queryprocess";
import editprocess from "./editprocess";

module.exports = {
  colorShape,
  createShape,
  updateShape,
  connectShapes,
  removeShape,
  addExtensionShape,
  removeExtensionShape
}

function colorShape(viewer, shape, coloroption) {
  let modeling = viewer.get('modeling');
  let _stroke = coloroption.stroke || 'black';
  let _fill = coloroption.fill || 'none';

  /*
  modeling.setColor(shape, {
    stroke: 'black',
    fill: 'grey'
  });
  */

  modeling.setColor(shape, {stroke: _stroke, fill: _fill});
}

function createShape(viewer, option) {
  let canvas = viewer.get('canvas');
  let elementFactory = viewer.get('elementFactory');
  let modeler = viewer.get('modeling');

  let pos_x = option.x || 50;
  let pos_y = option.y || 50;
  let type = option.type || 'bpmn:Task';
  let name = option.name;

  let root = canvas._rootElement;
  let shape = elementFactory.create('shape', { //https://github.com/bpmn-io/bpmn-js/issues/669
    type: type
  });

  modeler.createShape(shape, {x: pos_x, y: pos_y}, root);
  modeler.updateLabel(shape, name);

  return shape;

  /*shape types

  bpmn:EndEvent
  bpmn:StartEvent
  bpmn:Task
  bpmn:SubProcess

  bpmn:DataStoreReference
  bpmn:DataObjectReference

  bpmn:ParallelGateway
  bpmn:ExclusiveGateway
   */
}

function removeShape(viewer, shape) {
  let modeler = viewer.get('modeling');
  modeler.removeShape(shape);
}

function updateShape(viewer, shape, option) {
  let modeler = viewer.get('modeling');
  let _option = option || {id: 'neueid'};

  modeler.updateProperties(shape, _option);

  return shape;
}

function connectShapes(viewer, source, target) {
  let modeler = viewer.get('modeling');
  let connection = modeler.connect(source, target);
  return connection;
}

function addExtensionShape(viewer, shape, option, extension) {
  let itcomponent = option.infra;
  let compliance = option.compliance;

  let _name;
  let _id;
  let _type;
  let _x = shape.x + (shape.width / 2);
  let _y;

  //define shape type
  if (itcomponent != null) {
    _name = itcomponent.name;
    _type = 'bpmn:DataStoreReference';
    _y = getBottomPosition(viewer) + shape.height + 100;
  }

  if (compliance != null) {
    _name = compliance.id;
    _type = 'bpmn:DataObjectReference';
    _y = getTopPosition(viewer) - shape.height - 20;
  }

  //create shape and get its element
  let dataShape = createShape(viewer, {name: _name, type: _type, x: _x, y: _y});
  let dataElement = dataShape.businessObject;

  //extend the element
  editprocess.addExtension(viewer, dataElement, extension);
  let ext = editprocess.createExtensionElement('flowelement', shape.id);
  editprocess.addExtension(viewer, dataElement, ext);

  // connect created shape with flownode and color it
  connectShapes(viewer, dataShape, shape);
  colorShape(viewer, dataShape, {stroke: 'grey'});

}

function removeExtensionShape(viewer, flowelement) {
  let elementRegistry = viewer.get('elementRegistry');
  let shapes = elementRegistry.getAll();
  let extShapes = []; //determine extension shapes belong to flowelement
  let shapes_to_remove = [];

  console.log(shapes.length);

  // 1. get all Shapes that have ext.name=flowelement
  // 2. get Extension of flowelement
  // 3. delete shapes that are not part of flowelement.extension
  // --> schleife über shapes --> let id=
  //   --> schleife über flowelement.ext --> wenn kein Treffer shape löschen

  for (let i in shapes) {
    let el = shapes[i].businessObject;
    let ext = queryprocess.getExtensionOfElement(el);
    if (ext != undefined) {
      //console.log('new el');
      //console.log(el);
      for (let j in ext) {
        //  console.log(ext[j]);
        //console.log(ext[j].name);

        if (ext[j].name == 'flowelement' && ext[j].value==flowelement.id) {
          extShapes.push(el);
          break;
        }

        // console.log(ext[j].value);
      }
    }
  }

  let flowExt = queryprocess.getExtensionOfElement(flowelement);


  if(flowExt.length==0){
    let removeShape = true;
    for (let j in extShapes) {
      let shapeExt = queryprocess.getExtensionOfElement(extShapes[j]);
      for (let k in shapeExt) {
        console.log('shapeext value', shapeExt[k].value);
        if (shapeExt[k].value == flowelement.id) {
          removeShape = true;
        }
      }

      if (removeShape) {
        shapes_to_remove.push(extShapes[j]);
        removeShape = false;
      } else {
        removeShape = true;
      }

    }
  }





  /*
  console.log(flowExt.length);

  for (let i in flowExt) {
    let valueFlowElement = flowExt[i].value;
    console.log('', flowExt[i].value);

    for (let j in extShapes) {
      let shapeExt = queryprocess.getExtensionOfElement(extShapes[j]);
      for (let k in shapeExt) {
        console.log('shapeext value', shapeExt[k].value);
        if (shapeExt[k].value == flowExt[i].value) {
          removeShape = false;
        }
      }

      if (removeShape) {
        shapes_to_remove.push(extShapes[j]);
        removeShape = false;
      } else {
        removeShape = true;
      }


    }
  }
*/
  console.log(shapes_to_remove);

  console.log(extShapes);

}

function getTopPosition(viewer) {
  let elementRegistry = viewer.get('elementRegistry');
  let shapeCollection = elementRegistry.getAll();
  let top = 0;

  for (let i = 0; i < shapeCollection.length; i++) {
    let shape = shapeCollection[i];
    let element = shape.businessObject;

    if (!queryprocess.hasExtension(element, 'compliance')) { //check if shape is a modelled extension
      if (shape.y != undefined) {
        if (top == 0) {
          top = shape.y;
        }
        if (shape.y < top) {
          top = shape.y;
        }
      }
    }
  }
  return top;
}

function getBottomPosition(viewer) {
  let elementRegistry = viewer.get('elementRegistry');
  let shapeCollection = elementRegistry.getAll();
  let bottom = 0;

  for (let i = 0; i < shapeCollection.length; i++) {
    let shape = shapeCollection[i];
    let element = shape.businessObject;

    if (!queryprocess.hasExtension(element, 'infra')) { //check if shape is a modelled as extension
      if (shape.y != undefined) {
        if (bottom == 0) {
          bottom = shape.y;
        }
        if (shape.y > top) {
          bottom = shape.y;
        }
      }
    }
  }
  return bottom;
}

function getViewerComponents() { //Möglichkeiten des Viewers
  let elementRegistry = viewer.get('elementRegistry');
  let overlays = viewer.get('overlays');
  let canvas = viewer.get('canvas');
  let elementFactory = viewer.get('elementFactory');
  let modeler = viewer.get('modeling');
}
