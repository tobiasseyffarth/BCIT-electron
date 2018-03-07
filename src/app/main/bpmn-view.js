const EventEmitter = require('events');

import BpmnJS from "bpmn-js";
import BpmnModeler from "bpmn-js/dist/bpmn-modeler.development";
import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import queryprocess from "./../control/queryprocess"

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
    this.loadBpmn('./resources/process/sample_process.bpmn');

  }

  async loadBpmn(url) {
    let _this = this;
    let data = await processio.readFile(url);

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

    let p = queryprocess.getProcess(this.viewer);
    console.log(p);

    let flowElements = [];
    let flowNodes = [];
    let sequenceFlows=[];

    flowElements=queryprocess.getFlowElementsOfProcess(p);
    flowNodes=queryprocess.getFlowNodesOfProcess(p);
    sequenceFlows=queryprocess.getSequenceFlowsofProcess(p);

    console.log('Flow Elements');
    for(let i=0; i<flowElements.length;i++){
      console.log(flowElements[i]);
    }

    console.log('Flow Nodes');
    for(let i=0; i<flowNodes.length;i++){
      console.log(flowNodes[i]);
    }

    console.log('Sequence Flow');
    for(let i=0; i<sequenceFlows.length;i++){
      console.log(sequenceFlows[i]);
    }

    console.log('Suche nach der ID');
    let node=queryprocess.getFlowElementById(p,'StartEvent_1');
    console.log(node);
  }

  getViewer() {
    return this.viewer;
  }
}

module.exports = bpmnViewer;
