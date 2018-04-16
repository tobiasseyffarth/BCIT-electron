import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "./../control/processio";
import loadInfrastructure from "./../data/infrastructure/loadInfrastructure";
import loadInfraKai from "./../data/infrastructure/loadInfraKai";
import queryInfra from './../control/queryInfrastructure';
import cytoscape from 'cytoscape';

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  xmlUploadButton: "#uploadInfrasturcture"
};

class infrastructureView {
  constructor(options) {
    if (!options) options = {};

    this.document = options.document;
    this.xmlUploadButton = options.xmlUploadButton || baseConfig.xmlUploadButton;

    this.initInfrastructureView();
    this.loadGraph();
  }

  initInfrastructureView() {
    //File open Dialog anlegen. Ausgewählte Datei wird dann dem Viewer zugeführt
    let uploadXML = this.document.querySelector(this.xmlUploadButton);
    if (uploadXML) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      uploadXML.addEventListener("click", () => this.xmlUploadOnClick());
    }
  }

  async xmlUploadOnClick() {
    //let data = dialogHelper.xmlFileOpenDialog();
    let xml = await processio.readFile('./resources/it-architecture/architecture.xml');
    let infra = loadInfraKai.getInfra(xml);
    console.log(infra);
  }

  loadGraph() {
    let infraContainer = this.document.querySelector('.container-infrastructure');

    let graph = cytoscape({
      container: infraContainer
    });

    graph.add([
      {group: "nodes", data: {id: "n0"}},
      {group: "nodes", data: {id: "n1"}},
      {group: "nodes", data: {id: "n2"}},
      {group: "edges", data: {id: "e0", source: "n0", target: "n1"}},
      {group: "edges", data: {id: "e1", source: "n1", target: "n2"}}
    ]);

    let layout = graph.layout({ name: 'grid' }); //weitere Optionen unter http://js.cytoscape.org/#layouts
    layout.run();
  }

}

module.exports = infrastructureView;
