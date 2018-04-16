import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "../control/processio";
import loadCompliance from "../data/compliance/loadCompliance";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  xmlUploadButton: "#uploadComplianceXML",
  infraContainer: "container-infrastructure"
};

class complianceView {
  constructor(options) {
    if (!options) options = {};

    this.document = options.document;
    this.xmlUploadButton = options.xmlUploadButton || baseConfig.xmlUploadButton;

    this.initComplianceView();
    //this.loadGraph();
  }

  initComplianceView() {
    //File open Dialog anlegen. Ausgewählte Datei wird dann dem Viewer zugeführt
    let uploadBpmn = this.document.querySelector(this.xmlUploadButton);
    if (uploadBpmn) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      uploadBpmn.addEventListener("click", () => this.xmlUploadOnClick());
    }
  }

  async xmlUploadOnClick() {
    //let data = dialogHelper.xmlFileOpenDialog();
    let xml = await processio.readFile('./resources/compliance/hgb.xml');
    let compliance = loadCompliance.getJSON(xml);
    console.log(compliance);
  }


  loadGraph() {

    //dem Graphen den infraContainer übergeben

    let infraContainer = this.document.querySelector('.container-infrastructure');

    let graph = cytoscape({
      // very commonly used options
      container: infraContainer
    });

    graph.add([
      {group: "nodes", data: {id: "n0"}, position: {x: 100, y: 100}},
      {group: "nodes", data: {id: "n1"}, position: {x: 200, y: 200}},
      {group: "nodes", data: {id: "n2"}, position: {x: 200, y: 200}},
      {group: "edges", data: {id: "e0", source: "n0", target: "n1"}},
      {group: "edges", data: {id: "e1", source: "n1", target: "n2"}}
    ]);

  }
}

module.exports = complianceView;
