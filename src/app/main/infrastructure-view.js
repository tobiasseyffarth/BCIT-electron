import gui from "../../helpers/gui";

const EventEmitter = require('events');

import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import loadInfrastructure from "./../data/infrastructure/loadInfrastructure";
import loadInfraKai from "./../data/infrastructure/loadInfraKai";
import queryInfra from './../control/queryInfrastructure';
import cytoscape from 'cytoscape';
import graphcreator from './../control/creategraph';
import log from "./../../helpers/logs";
import queryprocess from "../control/queryprocess";
import editprocess from "../control/editprocess";

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

    this.graph = cytoscape({
      container: this.infraContainer,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'label': 'data(name)',
            'shape': 'triangle'
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': 'blue',
            'mid-target-arrow-color': 'red',
            'mid-target-arrow-shape': 'triangle',
            'line-style': 'dotted'
          }
        }
      ],
    }); // create an enmpty graph and define its style
    this.infra = null; // stores our infrastructure model
    this.selectedNode = null; //selected graph node //todo: beim Verbinden der Kanten mi intergierten Graphen verwenden.
    this.selectedElement = null; // query IT component from selectedNode

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

    let xml = await processio.readFile('./resources/it-architecture/architecture.xml'); //read infra-exchange-file
    this.infra = loadInfraKai.getInfra(xml); //parsing infra-exchange-file
    this.renderInfraXml(); //render infra to gui
  }

  async xmlUploadOnClick() {
    //let data = dialogHelper.xmlFileOpenDialog();
    //this.infra = loadInfraKai.getInfra(xml); //parsing infra-exchange-file
    //this.renderGraph(); //render infra to gui
  }

  renderInfraXml() {
    graphcreator.createGraphFromInfra(this.graph, this.infra);
    let layout = this.graph.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
    layout.run();
    this.graph.autolock(false); //elements can not be moved by the user
    log.info('infra_rendered');
    this.emit('infra_rendered', {done: true});
  }

  clickGraph() { //weitere Events: http://js.cytoscape.org/#events/user-input-device-events
    let _this = this;
    this.graph.on('tap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element === _this.graph) {
        //console.log('tap on background');
        _this.clearITProps();
      } else {
        if (element.isNode()) {
          console.log('taped on node');

          _this.clearITProps();
          _this.selectedNode = element;
          _this.selectedElement = queryInfra.getElementById(_this.infra, _this.selectedNode.id());
          _this.renderITProps();
        }
        if (element.isEdge()) {
          //console.log('taped on edge');
        }
        //console.log('tap on some element');
      }

    });
  }

  clearITProps() {
    this.infraName.textContent = "";
    this.infraId.value = "";
    this.infraProps.textContent = "";
    this.selectedElement = null;
  }

  renderITProps() {
    this.infraId.value = this.selectedNode.id();
    this.infraName.textContent = this.selectedNode.data('name');

    let props = this.selectedNode.data('props');
    gui.clearList(this.infraProps);
    if (props.length > 0) { //getElementProperties and display in ProperyPanel
      for (let i in props) {
        let option = new Option();
        option.text = props[i].name + ': ' + props[i].value;
        this.infraProps.add(option);
      }
    }
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

}

module.exports = infrastructureView;
