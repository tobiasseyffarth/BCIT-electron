const EventEmitter = require('events');

import BpmnJS from "bpmn-js";
import propertiesPanelModule from "bpmn-js-properties-panel";
import propertiesProviderTobus from "./../data/bpmnjsComplianceProvider";

import BpmnModeler from "bpmn-js/dist/bpmn-modeler.development";
import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import queryprocess from "./../control/queryprocess";
import editprocess from "./../control/editprocess";
import creategraph from "./../control/creategraph";
import graphrenderer from "./../control/rendergraph";

import log from "./../../helpers/logs";
import gui from "./../../helpers/gui";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  bpmnContainer: ".bpmn-io",
  bpmnUploadButton: "#uploadBpmn",
  propertiesPanel: ".container-properties",
  btnExportbpmn: "#btnExport_bpmn"
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
    this.document = options.document;

    this.bpmnContainer = options.bpmnContainer || baseConfig.bpmnContainer;
    this.propertiesPanel = options.propertiesPanel || baseConfig.propertiesPanel;
    this.bpmnUploadButton = options.bpmnUploadButton || baseConfig.bpmnUploadButton;
    this.btnExportbpmn = options.btnExportbpmn || baseConfig.btnExportbpmn;
    this.flownodeId = this.document.getElementById('flownode-id');
    this.flownodeName = this.document.getElementById('flownode-name');
    this.flownodeProps = this.document.getElementById('flownode-props');
    this.cbxCompliance = this.document.getElementById('cbx-compliance');
    this.btnClear = this.document.getElementById('btnClearProcess');
    this.btnRmvExt = this.document.getElementById('btnRmvExt');


    this.viewer = null;
    this.selectedElement = null; //todo: beim Verbinden der Kanten mi intergierten Graphen verwenden.
    this.process = null; //processmodel of viewer

    this.initViewer();
    this.loadBpmn('./resources/process/sample_process.bpmn');
  }

  initViewer() { //hier noch die Moodle Extension einbauen: https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel-extension#plugging-everything-together

    this.viewer = new BpmnModeler({
      container: this.bpmnContainer
    });
    /*
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
 */
    /*
    Possible with property panel
    https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel

    Und extensions dazu
    https://github.com/bpmn-io/bpmn-js-examples/tree/master/properties-panel-extension
    */

    //File open Dialog anlegen. Ausgewählte Datei wird dann dem Viewer zugeführt
    let uploadBpmn = this.document.querySelector(this.bpmnUploadButton);
    let exportBpmn = this.document.querySelector(this.btnExportbpmn);

    if (uploadBpmn) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      uploadBpmn.addEventListener("click", () => this.bpmnUploadOnClick(), true);
    }

    if (exportBpmn) {
      exportBpmn.addEventListener("click", () => this.exportBpmn(), true);
    }

    if (this.btnClear) {
      this.btnClear.addEventListener("click", () => this.clearProcessProps(), true);
    }

    if (this.btnRmvExt) {
      this.btnRmvExt.addEventListener("click", () => this.removeExtension(), true);
    }

    if (this.cbxCompliance) {
      this.cbxCompliance.addEventListener("click", () => this.defineComplianceProcess(), true);
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

  async exportBpmn() {
    if (this.viewer == null) {
      log.info('No process imported');
    } else {
      let promise = await dialogHelper.bpmnFileSaveDialog(processio.saveXml(this.viewer)).catch(function (err) {
        console.log('error');
      });
      if (promise != undefined) {
        log.info('Process exported to' + promise)
      }
    }
  }

  renderBpmnXml(xml) {
    let _this = this;

    this.viewer.importXML(xml, function (err) {
      if (err) {
        console.error('error rendering', err);
      } else {
        _this.process = queryprocess.getProcess(_this.viewer);
        _this.bpmnFitViewport();
        _this.hookEventBus();
        log.info("BPMN file rendered");
        _this.emit('process_rendered', {done: true});
      }
    });
  }

  updateBpmn(viewer) { //rerender Process view
    let xml = processio.saveXml(viewer);
    this.renderBpmnXml(xml);
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
    //this.selectedElement=e.element; //e.element returns a shape element and not a moddle element

    this.document.querySelector('.selected-element-id').textContent = e.element.id;
    this.selectedElement = queryprocess.getFlowElementById(this.process, e.element.id); //get element of bpmnviewer register

    //editprocess.addElements(this.viewer, this.process);
    //editprocess.addExtension(this.viewer, this.selectedElement);

    this.showProcessProps();
    this.emit('flownode_updated', {done: true});

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

  getProcess() {
    return this.process;
  }

  showProcessProps() {
    let element = this.selectedElement;

    this.flownodeId.value = element.id;
    this.flownodeName.textContent = element.name;
    this.cbxCompliance.checked = queryprocess.isCompliance(element);


    console.log(queryprocess.getExtensionOfElement(element));
  }

  clearProcessProps() {
    this.flownodeId.value = "";
    this.flownodeName.textContent = "";
    this.cbxCompliance.checked = false;
    gui.clearList(this.flownodeProps);
  }

  showProcessExtension(){ //

  }

  removeExtension() {
    console.log('click');
  }

  defineComplianceProcess() {
    if (this.cbxCompliance.checked == true) {
      editprocess.defineAsComplianceProcess(this.viewer, this.selectedElement, true);
    } else {
      editprocess.defineAsComplianceProcess(this.viewer, this.selectedElement, false);
    }
    console.log(this.selectedElement);
  }

}

module.exports = bpmnViewer;
