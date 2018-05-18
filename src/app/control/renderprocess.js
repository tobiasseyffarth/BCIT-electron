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

//final
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

//final
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

//final
function removeShape(viewer, shape) {
  let modeler = viewer.get('modeling');

  try {
    modeler.removeShape(shape);
  } catch (err) {
    console.log(err);
  }
}

//final
function updateShape(viewer, shape, option) {
  let modeler = viewer.get('modeling');
  let _option = option || {id: 'neueid'};

  modeler.updateProperties(shape, _option);

  return shape;
}

//final
function connectShapes(viewer, source, target) {
  let modeler = viewer.get('modeling');
  let connection = modeler.connect(source, target);
  return connection;
}

//final
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

//final
function removeExtensionShape(viewer, flowelement) {
  let elementRegistry = viewer.get('elementRegistry');
  let shapes = elementRegistry.getAll();
  let extShapes = []; //determine extension shapes belong to flowelement
  let shapes_to_remove = [];

  // 1. get all extensionShapes that belongs to the selected flowelement--> done
  for (let i in shapes) {
    let shape = shapes[i];
    let element = shape.businessObject;
    let isExtShape = queryprocess.isExtensionShape(shape);
    let belongsToFlowelement = queryprocess.hasExtension(element, 'flowelement', flowelement.id);

    if (isExtShape && shape.type != 'label' && belongsToFlowelement) {
      extShapes.push(shape);
    }
  }
//  console.log(extShapes);

  // 2. get value Extension of flowelement
  let ext = queryprocess.getExtensionOfElement(flowelement);
  let valueFlowelement = [];
  let valueShape = [];

  for (let i in ext) {
    let value = ext[i].value;
    valueFlowelement.push(value);
  }
  //console.log(valueFlowelement);

  //3. get ID of Requirement or ITComponent stored in the ShapeExtension
  for (let i in extShapes) {
    let shape = extShapes[i];
    let element = shape.businessObject;
    let shapeExtension = queryprocess.getExtensionOfElement(element);

    //console.log(element);
    //console.log(shapeExtension);

    for (let j in shapeExtension) {
      let name = shapeExtension[j].name;
      let value = shapeExtension[j].value;
      //console.log(name);
      if (name != 'flowelement') {
        valueShape.push({shape: shape, value: value});
      }
    }
  }
  //console.log(valueShape);

  //4a check wheather flowelement has no extension
  if (valueFlowelement.length == 0) {
    for (let i in extShapes) {
      let shape = extShapes[i];
      shapes_to_remove.push(shape);
    }
  }

  // 4b. check weather ID of Requirement or ITComponent is in valueFlowElements
  if (valueFlowelement.length > 0) {
    let del = true;

    for (let i in valueShape) {
      let valueS = valueShape[i].value;
      //console.log('valueShapeExt', valueS);
      for (let j in valueFlowelement) {
        let valueF = valueFlowelement[j];
        //console.log('valueFlowelement', valueF);

        if (valueF == valueS) {
          del = false;
        }
      }

      if (del) {
        shapes_to_remove.push(valueShape[i].shape)
      } else {
        del = true;
      }
    }
  }

  //5. delete shapes
  //console.log(shapes_to_remove);
  for (let i in shapes_to_remove) {
    let shape = shapes_to_remove[i];
    removeShape(viewer, shape);
  }
}

//final
function getTopPosition(viewer) {
  let elementRegistry = viewer.get('elementRegistry');
  let shapeCollection = elementRegistry.getAll();
  let top = 0;

  for (let i = 0; i < shapeCollection.length; i++) {
    let shape = shapeCollection[i];
    let element = shape.businessObject;

    if (!queryprocess.isExtensionShape(shape)) { //check if shape is a modelled extension
      if (shape.y != undefined) {
        if (top == 0) {
          top = shape.y;
        }
        if (shape.y < top) {
          top = shape.y;
        }
      }
    } else {
      console.log(element);
    }
  }
  return top;
}

//final
function getBottomPosition(viewer) {
  let elementRegistry = viewer.get('elementRegistry');
  let shapeCollection = elementRegistry.getAll();
  let bottom = 0;

  for (let i = 0; i < shapeCollection.length; i++) {
    let shape = shapeCollection[i];
    let element = shape.businessObject;

    if (!queryprocess.isExtensionShape(shape)) { //check if shape is a modelled as extension
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
