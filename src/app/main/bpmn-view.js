const EventEmitter = require('events');

import BpmnModeler from "bpmn-js/dist/bpmn-modeler.development";
import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import queryprocess from "./../control/queryprocess";
import editprocess from "./../control/editprocess";
import renderprocess from "./../control/renderprocess";

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
    this.lstnodeExtension = this.document.getElementById('flownode-props');
    this.cbxCompliance = this.document.getElementById('cbx-compliance');
    this.btnClear = this.document.getElementById('btnClearProcess');
    this.btnRmvExt = this.document.getElementById('btnRmvExt');

    this.viewer = null;
    this.selectedElement = null; //moddleElement
    this.selectedShape = null; //Shape
    this.process = null; //processmodel of viewer
    this.key = null; //get crtl. or alt.

    this.initViewer();
    this.loadBpmn('./resources/process/sample_process.bpmn');
  }

  initViewer() {
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
      this.btnRmvExt.addEventListener("click", () => this.removeProcessExtension(), true);
    }

    if (this.cbxCompliance) {
      this.cbxCompliance.addEventListener("click", () => this.defineComplianceProcess(), true);
    }

    if (this.document) {
      this.document.addEventListener("keydown", () => this.onKeyDown(event), true);
      this.document.addEventListener("keyup", () => this.onKeyUp(event), true);
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
    if (this.viewer == null || queryprocess.getFlowElementsOfProcess(this.process)==null) {
      log.info('No process imported');
    } else {
      let promise = await dialogHelper.bpmnFileSaveDialog(processio.getXml(this.viewer)).catch(function (err) {
        console.log('error');
      });
      if (promise != undefined) {
        log.info('Process exported to' + promise)
      }
    }
  }

  newProject() {
    this.loadBpmn('./resources/process/empty_bpmn.bpmn')
    this.clearProcessProps();
  }

  renderBpmnXml(xml) {
    let _this = this;

    _this.viewer.importXML(xml, function (err) {
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

  updateBpmnXml(viewer) { //rerender Process view
    let _viewer = viewer || this.viewer

    let xml = processio.saveXml(_viewer);
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
    let shape = e.element;
    this.selectedShape = shape;
    let isAllowed = queryprocess.isTaskOrSubprocess({shape: shape});

    if (isAllowed) { //just add elements to and edit flownodes
      //this.document.querySelector('.selected-element-id').textContent = e.element.id;
      this.selectedElement = queryprocess.getFlowElementById(this.process, shape.id); //get element of bpmnviewer register

      this.renderProcessProps();

      //Analyze FlowElement
      if (this.key == 17 || this.key == 18) {
        let id = shape.id;
        this.emit('analyze', {done: true, id: id, key: this.key});
      }
    }

    //Analyze shape extension
    let isExtShape = queryprocess.isExtensionShape(shape);

    if ((this.key == 17 || this.key == 18) && isExtShape) {
      console.log('start analyze');
      let id = queryprocess.getIdFromExtensionShape(shape);
      this.emit('analyze', {done: true, id: id, key: this.key});
    }

  }

  onKeyDown(event) {
    this.key = event.which;
  }

  onKeyUp(event) {
    this.key = null;
  }

  renderProcessProps() {
    let element = this.selectedElement;
    let shape = this.selectedShape;
    let isCompliance = queryprocess.isCompliance(element);

    this.clearProcessProps();

    this.flownodeId.value = element.id;
    this.flownodeName.textContent = element.name;
    this.cbxCompliance.checked = isCompliance;

    this.renderComplianceProcess(shape, isCompliance);
    this.renderProcessExtension();
  }

  clearProcessProps() {
    this.flownodeId.value = "";
    this.flownodeName.textContent = "";
    this.cbxCompliance.checked = false;
    gui.clearList(this.lstnodeExtension);
  }

  renderProcessExtension() { //
    gui.clearList(this.lstnodeExtension);
    let extension = queryprocess.getExtensionOfElement(this.selectedElement);
    gui.renderExtensionProps(extension, this.lstnodeExtension);
  }

  renderComplianceProcess(shape, isCompliance) {
    let viewer = this.viewer;

    if (isCompliance) {
      renderprocess.colorShape(viewer, shape, {fill: 'grey'});
    } else {
      renderprocess.colorShape(viewer, shape, {fill: 'none'});
    }
  }

  removeProcessExtension() {
    let index = this.lstnodeExtension.selectedIndex;
    if (index > -1) {
      editprocess.removeExt(this.selectedElement.extensionElements, {index: index});
      this.renderProcessProps(); //
      this.emit('flowelement_updated', {done: true});
    }
  }

  defineComplianceProcess() {
    let viewer = this.viewer;
    let element = this.selectedElement;
    let isCompliance = this.cbxCompliance.checked;

    if (isCompliance) {
      editprocess.defineAsComplianceProcess(viewer, element, true);
    } else {
      editprocess.defineAsComplianceProcess(viewer, element, false);
    }

    this.renderProcessProps();
    this.emit('flowelement_updated', {done: true});
  }

}

module.exports = bpmnViewer;
