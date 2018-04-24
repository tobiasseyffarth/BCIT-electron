const EventEmitter = require('events');

import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import loadInfrastructure from "./../data/infrastructure/loadInfrastructure";
import loadInfraKai from "./../data/infrastructure/loadInfraKai";
import queryInfra from './../control/queryInfrastructure';
import cytoscape from 'cytoscape';
import graphcreator from './../control/creategraph';
import log from "./../../helpers/logs";

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

    this.btnClear = this.document.getElementById('btnClear');
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
    this.selectedElement = null; //todo: beim Verbinden der Kanten mi intergierten Graphen verwenden.

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
          //console.log('taped on node');
          _this.selectedElement = element;
          _this.clearITProps();
          _this.showITProps();
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
  }

  showITProps() {
    this.infraId.value = this.selectedElement.id();
    this.infraName.textContent = this.selectedElement.data('name');

    let props = this.selectedElement.data('props');
    if (props.length > 0) { //getElementProperties and display in ProperyPanel
      for (let i in props) {
        this.infraProps.textContent = this.infraProps.textContent + '\r \n' + props[i].name + ": " + props[i].value;
      }
    }
  }

}

module.exports = infrastructureView;
