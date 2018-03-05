const EventEmitter = require('events');

import BpmnJS from "bpmn-js";
import BpmnModeler from "bpmn-js/dist/bpmn-modeler.development";
import dialogHelper from "./../../helpers/fileopen_dialogs";
import queryprocess from "./../control/queryprocess";
import fs from "fs";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  bpmnContainer: ".bpmn-io",
  bpmnUploadButton: "#uploadBpmn"
};


class bpmnViewer extends EventEmitter {
  /**
   * Init bpmnViewer class with options
   * @param options typeof Object
   **** bpmnContainer html element for bmpn.js
   **** bpmnUploadButton html element for upload button
   */
  constructor(options) {
    super();

    if (!options) options = {};

    this.bpmnContainer = options.bpmnContainer || baseConfig.bpmnContainer;
    this.bpmnUploadButton = options.bpmnUploadButton || baseConfig.bpmnUploadButton;
    this.document = options.document;
    this.viewer = null;
    this.selectedElement = null;
    this.initViewer();

    console.log(queryprocess.getOut('hallo'));

    queryprocess.readFile("C:\\Users\\Tobias Seyffarth\\Desktop\\Import Kolloquium\\businessprocess kolloquium.bpmn");

  }

  initViewer() {
    this.viewer = new BpmnModeler({
      container: this.bpmnContainer
    });

    /*
    Possible with property panel
    https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel

    Und extensions dazu
    https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel-extension
    */

    //File open Dialog anlegen. Ausgewählte Datei wird dann dem Viewer zugeführt
    let uploadBpmn = this.document.querySelector(this.bpmnUploadButton);
    if (uploadBpmn) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      uploadBpmn.addEventListener("click", () => this.bpmnUploadOnClick(), true);
    }
  }

  async bpmnUploadOnClick() {
    let _this = this;
    let data = await dialogHelper.bpmnFileOpenDialog();
    console.log("bpmn upload clicked");
    console.log(data);


    this.viewer.importXML(data, function (err) {
      if (err) {
        console.error('error rendering', err);
      } else {
        _this.emit('rendered', {done: true});

        _this.bpmnFitViewport();
        _this.hookEventBus();
      }
    });
  }


  bpmnFitViewport() {
    let canvas = this.viewer.get('canvas');
    canvas.zoom('fit-viewport');
  }

  hookEventBus() {
    let eventBus = this.viewer.get('eventBus');

    /*
    // you may hook into any of the following events
    var events = [
      'element.hover',
      'element.out',
      'element.click',
      'element.dblclick',
      'element.mousedown',
      'element.mouseup'
    ];
     */

    eventBus.on('element.click', (e) => this.hookOnClick(e));
    // eventBus.on('element.hover', (elem) => { console.log("Hover", elem.element.id); });
  }

  hookOnClick(e) {
    this.document.querySelector('.selected-element-id').textContent = e.element.id;
    console.log('onClick', e.element);

    let process = getProcess(this.viewer, e);
    let processelement = getElement(this.viewer, e);
    let elements = [];
    elements = getFlowElementsOfProcess(process);

    console.log(process.id, 'Anzahl der FlowElements', elements.length);
    for (let i = 0; i < elements.length; i++) {
      console.log(elements[i].id);
      console.log(getElementOfRegistry(this.viewer, elements[i].id));

      //properties ändern, variante 1
      getElementOfRegistry(this.viewer, elements[i].id).name = 'test';

      /*
      //properties ändern, variante 2
      let modeling = this.viewer.get('modeling');

      modeling.updateProperties(getElementOfRegistry(this.viewer, elements[i].id), {
        id: i
      });
*/
    }

  }


  getViewer() {
    return this.viewer;
  }
}


function getElement(viewer, e) {
  return e.element;
}

function getDirectPredecessor(element) {

}

function getDirectSucessor(element) {

}

//Überladen, wenn eingabe einmal der Viewr und einmal ein Node ist??
function getProcess(viewer, e) {
  let elementRegistry = viewer.get('elementRegistry');
  let nodeElement = elementRegistry.get(e.element.id);
  let node = nodeElement.businessObject;
  let process = elementRegistry.get(node.$parent.id);

  return process;
}

function getElementOfRegistry(viewer, id) {
  let elementRegistry = viewer.get('elementRegistry');
  let element = elementRegistry.get(id);

  return element.businessObject;
}


function getNodesOfRegistry(flowelements) {

}

function getSequenceflowsofRegistry(flowelements) {

}

//funktioniert nicht
function getFlowElementsOfProcess(process) {
  let flowElements = [];

  for (let i = 0; i < process.businessObject.flowElements.length; i++) {
    flowElements.push(process.businessObject.flowElements[i]);
  }

  return flowElements;
}

function getFlowElementById(flowelements, id) {

}


module.exports = bpmnViewer;
