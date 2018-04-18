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
    let xml = await processio.readFile('./resources/it-architecture/architecture.xml'); //read file
    this.infra = loadInfraKai.getInfra(xml); //parsing file
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
    this.graph.on('tap', 'node', function (evt) {
      let node = evt.target;
      _this.infraElement.textContent = node.id() + ", " + node.data('name');
    });
  }

}

module.exports = infrastructureView;
