const EventEmitter = require('events');

import BpmnJS from "bpmn-js";
import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderTobus from "./../data/bpmnjsComplianceProvider";

import BpmnModeler from "bpmn-js/dist/bpmn-modeler.development";
import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import queryprocess from "./../control/queryprocess";
import editprocess from "./../control/editprocess"

import log from "./../../helpers/logs";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  bpmnContainer: ".bpmn-io",
  bpmnUploadButton: "#uploadBpmn",
  propertiesPanel: ".container-properties"
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
    this.propertiesPanel = options.propertiesPanel || baseConfig.propertiesPanel;
    this.bpmnUploadButton = options.bpmnUploadButton || baseConfig.bpmnUploadButton;
    this.document = options.document;
    this.viewer = null;
    this.selectedElement = null;
    this.process = null;
    this.initViewer();
    this.loadBpmn('./resources/process/sample_process.bpmn');
  }

  initViewer() { //hier noch die Moodle Extension einbauen: https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel-extension#plugging-everything-together
    this.viewer = new BpmnModeler({
      container: this.bpmnContainer,
      propertiesPanel: {
        parent: this.propertiesPanel
      },
      additionalModules: [
        propertiesPanelModule,
        propertiesProviderTobus
      ]
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
    let data = await dialogHelper.bpmnFileOpenDialog();
    this.renderBpmnXml(data)
  }

  async loadBpmn(url) {
    let data = await processio.readFile(url);
    this.renderBpmnXml(data);
  }

  renderBpmnXml(xml) {
    let _this = this;
    this.viewer.importXML(xml, function (err) {
      if (err) {
        console.error('error rendering', err);
      } else {
        _this.emit('rendered', {done: true});
        _this.bpmnFitViewport();
        _this.hookEventBus();

        //console.log('Element registry');
        //console.log(_this.viewer.get('elementRegistry'));

        _this.process = queryprocess.getProcess(_this.viewer);
        //console.log(_this.process);

        log.info("BPMN file rendered");
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

    let element = queryprocess.getFlowElementById(this.process, e.element.id);

    //editprocess.addElements(this.viewer, this.process);

    console.log(element);

    let flowElements = [];
    let flowNodes = [];
    let sequenceFlows = [];

    /*
        flowElements = queryprocess.getFlowElementsOfProcess(this.process);
        flowNodes = queryprocess.getFlowNodesOfProcess(this.process);
        sequenceFlows = queryprocess.getSequenceFlowsofProcess(this.process);


        console.log('Flow Elements');
        for (let i = 0; i < flowElements.length; i++) {
          console.log(flowElements[i]);
        }

        console.log('Flow Nodes');
        for (let i = 0; i < flowNodes.length; i++) {
          console.log(flowNodes[i]);
        }

        console.log('Sequence Flow');
        for (let i = 0; i < sequenceFlows.length; i++) {
          console.log(sequenceFlows[i]);
        }

        console.log('Suche nach der ID');
        let node = queryprocess.getFlowElementById(p, 'StartEvent_1');
        console.log(node);
      */
  }

  getViewer() {
    return this.viewer;
  }
}

module.exports = bpmnViewer;
