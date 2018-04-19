import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import loadInfrastructure from "./../data/infrastructure/loadInfrastructure";
import loadInfraKai from "./../data/infrastructure/loadInfraKai";
import queryInfra from './../control/queryInfrastructure';
import cytoscape from 'cytoscape';
import creategraph from './../control/creategraph';
import log from "./../../helpers/logs";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  xmlUploadButton: "#uploadInfra",
};

class infrastructureView {
  constructor(options) {
    if (!options) options = {};

    this.document = options.document;
    this.xmlUploadButton = options.xmlUploadButton || baseConfig.xmlUploadButton;
    this.infraContainer = this.document.querySelector('.infra-io');
    this.infraElement = this.document.getElementById('selected-infra-element');

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
    this.renderGraph(); //render infra to gui
  }

  async xmlUploadOnClick() {
    //let data = dialogHelper.xmlFileOpenDialog();
  }

  renderGraph() {
    creategraph.createGraphFromInfra(this.graph, this.infra);
    let layout = this.graph.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
    layout.run();
    this.graph.autolock(false); //elements can not be moved by the user
    log.info('infrastructure rendered');
  }

  clickGraph() { //weitere Events: http://js.cytoscape.org/#events/user-input-device-events
    let _this = this;
    this.graph.on('tap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element=== _this.graph) {
        //console.log('tap on background');
        _this.clearITProps();
      } else {
        if(element.isNode()){
          //console.log('taped on node');
          let node = element;
          _this.clearITProps();
          _this.infraElement.textContent = node.id() + ", " + node.data('name');
          _this.infraId.value = node.id();
          _this.infraName.textContent = node.data('name');

          let props = node.data('props');
          if (props.length > 0) { //getElementProperties and display in ProperyPanel
            for (let i in props) {
              _this.infraProps.textContent = _this.infraProps.textContent + '\n' + props[i].name + ": " + props[i].value;
            }
          }

        }
        if(element.isEdge()){
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

}

module.exports = infrastructureView;
