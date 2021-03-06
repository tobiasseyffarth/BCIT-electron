const EventEmitter = require('events');

import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import loadInfraKai from "./../data/infrastructure/loadInfraKai";
import queryInfra from './../control/queryInfrastructure';
import cytoscape from 'cytoscape';
import graphcreator from './../control/creategraph';
import log from "./../../helpers/logs";
import gui from "../../helpers/gui";
import rendergraph from "./../control/rendergraph";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  xmlUploadButton: "#uploadInfra",
};

class infrastructureView extends EventEmitter {
  constructor(options) {
    super();
    if (!options) options = {};

    this.document = options.document;
    this.xmlUploadButton = options.xmlUploadButton || baseConfig.xmlUploadButton;
    this.infraContainer = this.document.querySelector('.infra-io');

    this.infraPanel = this.document.getElementById('infra-panel');
    this.btnClear = this.document.getElementById('btnClear');
    this.btnRemove = this.document.getElementById('btnRmvProp');
    this.infraName = this.document.getElementById('infra-name'); // get Textfield from Propertypanel Infra
    this.infraId = this.document.getElementById('infra-id'); // get ID-Field from Propertypanel Infra
    this.infraProps = this.document.getElementById('infra-props'); // get Props-Field from Propertypanel Infra
    this.processPanel = this.document.getElementById('process-panel');

    this.graph = cytoscape({
      container: this.infraContainer,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'label': 'data(display_name)',
            'shape': 'triangle',
            'background-color': '#ffffff',
            'border-style': 'solid',
            'border-color': '#666666',
            'border-width': 1
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': '#1c2966',
            'mid-target-arrow-color': '#3040b7',
            'mid-target-arrow-shape': 'triangle',
            'line-style': 'dotted'
          }
        }
      ],
    }); // create an enmpty graph and define its style
    this.infra = null; // stores our infrastructure model
    this.selectedNode = null; //selected graph node
    this.selectedElement = null; // query IT component from selectedNode
    this.dragEvent = null;
    this.key = null;

    this.initInfrastructureView();
    this.clickGraph();
  }

  async initInfrastructureView() {
    //File open Dialog anlegen. Ausgewählte Datei wird dann dem Viewer zugeführt
    let uploadXML = this.document.querySelector(this.xmlUploadButton);

    if (uploadXML) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      uploadXML.addEventListener("click", () => this.xmlUploadOnClick());
    }

    if (this.btnClear) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      this.btnClear.addEventListener("click", () => this.clearITProps());
    }

    if (this.btnRemove) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      this.btnRemove.addEventListener("click", () => this.removeITProps());
    }

    if (this.infraPanel) {
      this.infraPanel.addEventListener("drag", () => this.linkInfraOnDrag(event));
    }

    if (this.processPanel) {
      this.processPanel.addEventListener("dragover", () => this.allowDrop(event));
      this.processPanel.addEventListener("drop", () => this.onDropProcesspanel(event, this.dragEvent));
    }

    if (this.document) {
      this.document.addEventListener("keydown", () => this.onKeyDown(event), true);
      this.document.addEventListener("keyup", () => this.onKeyUp(event), true);
    }

    //let xml = await processio.readFile('./resources/it-architecture/empty_infra.xml'); //read infra-exchange-file
    // let xml = await processio.readFile('./resources/it-architecture/architecture.xml'); //read infra-exchange-file
    // this.infra = loadInfraKai.getInfra(xml); //parsing infra-exchange-file
    // this.renderInfraXml(); //render infra to gui
  }

  async xmlUploadOnClick() {
    let xml = await dialogHelper.infraFileOpenDialog();
    this.infra = loadInfraKai.getInfra(xml); //parsing infra-exchange-file
    this.renderInfraXml(); //render infra to gui
  }

  newProject() {
    graphcreator.removeModeltypeFromGraph(this.graph, 'infra');
    this.infra = null;
    this.clearITProps();
  }

  openProject(infra) {
    this.newProject();
    this.infra = infra;
    this.renderInfraXml(true);
  }

  renderInfraXml(openProject) {
    graphcreator.createGraphFromInfra(this.graph, this.infra);
    let layout = this.graph.layout({name: 'breadthfirst'}); //more options http://js.cytoscape.org/#layouts
    layout.run();
    this.graph.autolock(false); //elements can not be moved by the user
    rendergraph.resizeGraph(this.graph);


    if (openProject == false || openProject == undefined) { //when loading a new infra model
      this.emit('infra_rendered', {done: true});
    }else{
      log.info('infrastructure rendered');
    }
  }

  clickGraph() { //weitere Events: http://js.cytoscape.org/#events/user-input-device-events
    let _this = this;

    _this.graph.on('tap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element === _this.graph) {
        //console.log('tap on background');
        _this.clearITProps();
      } else {
        if (element.isNode()) {
          _this.clearITProps();
          _this.selectedNode = element;
          _this.selectedElement = queryInfra.getElementById(_this.infra, _this.selectedNode.id());
          _this.renderITProps();

          // starting analyze in case of press key
          if (_this.key == 17 || _this.key == 18) {
            let id = element.id();
            _this.emit('analyze', {done: true, id: id, key: _this.key});
          }
        }
        if (element.isEdge()) {
          //console.log('taped on edge');
        }
        //console.log('tap on some element');
      }
    });

    _this.graph.on('cxttap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element === _this.graph) {
        rendergraph.resizeGraph(_this.graph);
      }
    });
  }

  onKeyDown(event) {
    if (event.which == 18) {
      this.ctrl = true;
    } else if (event.which == 17) {
      this.alt = true;
    }
    this.key = event.which;
  }

  onKeyUp(event) {
    this.ctrl = false;
    this.alt = false;
    this.key = null;
  }

  clearITProps() {
    this.infraName.textContent = "";
    this.infraId.value = "";
    this.infraProps.textContent = "";
    this.selectedElement = null;
  }

  renderITProps() {
    this.infraId.value = this.selectedNode.id();
    this.infraName.textContent = this.selectedNode.data('display_name');

    let props = this.selectedNode.data('props');
    gui.clearList(this.infraProps);
    gui.renderInfraProps(props, this.infraProps);
  }

  removeITProps() {
    let index = this.infraProps.selectedIndex;

    if (index > -1) {
      this.selectedElement = queryInfra.getElementById(this.infra, this.selectedNode.id());
      queryInfra.removeITProps(this.selectedElement, index);
      graphcreator.updateITComponentProperty(this.graph, this.selectedElement);
      this.renderITProps();
      this.emit('remove_itcomponent_props', {done: true});
    }
  }

  linkInfraOnDrag(ev) {
    ev.dataTransfer.setData("text", ev.target.id); //geht nicht
    this.dragEvent = ev;
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  onDropProcesspanel(ev, dragEv) {
    ev.preventDefault();

    if (dragEv != null) {
      let dragSource = dragEv.target.id;

      if (dragSource == this.infraPanel.id) {
        this.dragEvent = null; //sichertstellen, dass nicht das Propertyfenster hier rein gezogen wird. //ToDo: wie kann das besser gehen?
        this.emit('link_infra-process', {done: true});
      }
    }
  }

}

module.exports = infrastructureView;
