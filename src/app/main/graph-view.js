import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "../control/processio";
import loadCompliance from "../data/compliance/loadCompliance";
import log from "./../../helpers/logs";
import graphcreator from "../control/creategraph";
import cytoscape from "cytoscape";
import infraclass from "./infrastructure-view";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  menuButton: "#menu"
};

class graphView {
  constructor(options) {
    if (!options) options = {};
    this.document = options.document;
    this.process = options.process; //process to be transformed in graph
    this.graphContainer = this.document.querySelector('.graph-io');
    this.closeButton = this.document.getElementById('btnClosePopGraph');
    this.graph = cytoscape({
      container: this.graphContainer,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#666',
            'label': 'data(id)'
          }
        },

        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'target-arrow-color': '#ccc',
            'target-arrow-shape': 'triangle'
          }
        }
      ],
      layout: {
        name: 'grid',
        rows: 1
      }
    }); // create an empty graph and define its style

    this.initGraphView();
    this.clickGraph();
  }

  initGraphView() {
    let close = this.closeButton;

    if (close) {
      close.addEventListener("click", () => this.closePopup());
    }
    this.document.getElementById("myMenu").style.width = "0px";
  }

  renderGraph(options) {
    let process = options.process;
    let infra = options.infra;
    let graph = this.graph;

    if (process != undefined) {
      graphcreator.createGraphFromProcess(graph, process);
    } else if (infra != undefined) {
      graphcreator.createGraphFromInfra(graph, infra);
    }

    let layout = this.graph.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
    layout.run();
    this.graph.autolock(false); //elements can not be moved by the user
    this.graph.reset();//Groesse anpassen
    this.graph.fit();// alle KNoten werden im Container angzeigt
    this.graph.resize();

    log.info('graph rendered');
  }

  closePopup() {
    log.info('click');
    console.log('click');

    this.document.getElementById("popGraph").style.width = "0px";
    this.document.querySelector('.ctrls').style.marginLeft = "0px";
    this.document.querySelector('.container-process').style.marginLeft = "0px";
    this.document.querySelector('.sub-container').style.marginLeft = "0px";
    this.document.querySelector('.container-log').style.marginLeft = "0px";
  }

  clickGraph() { //weitere Events: http://js.cytoscape.org/#events/user-input-device-events
    let _this = this;
    this.graph.on('tap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element === _this.graph) {
        console.log('tap on background');
      } else {
        if (element.isNode()) {
          console.log('taped on node');
        }
        if (element.isEdge()) {
          console.log('taped on edge');
        }
        console.log('tap on some element');

        _this.graph.forceRender();
        _this.graph.reset();//Groesse anpassen
        _this.graph.fit();// alle KNoten werden im Container angzeigt
        _this.graph.resize(); //Komplette Container nutzen

      }

    });
  }

}

module.exports = graphView;
