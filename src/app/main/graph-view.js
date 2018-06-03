import log from "./../../helpers/logs";
import graphcreator from "../control/creategraph";
import cytoscape from "cytoscape";
import gui from "./../../helpers/gui";
import query from "./../control/querygraph";

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
    // this.process = options.process; //process to be transformed in graph
    this.graphContainer = this.document.querySelector('.graph-io');
    this.closeButton = this.document.getElementById('btnClosePopGraph');
    this.btnClear = this.document.getElementById('btnClear-graph');
    this.nodeName = this.document.getElementById('node-name'); // get Textfield from Propertypanel Infra
    this.nodeId = this.document.getElementById('node-id'); // get ID-Field from Propertypanel Infra
    this.nodeProps = this.document.getElementById('node-props'); // get Props-Field from Propertypanel Infra

    this.graph = cytoscape({
      container: this.graphContainer,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': '#ffffff',
            'border-style': 'solid',
            'border-color': '#666',
            'border-width': 1,
            'label': 'data(id)',
            'font-size': 10,
            'text-wrap': 'wrap',
            'text-max-width': 20
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 1,
            'line-color': '#666',
            'mid-target-arrow-color': '#666',
            'mid-target-arrow-shape': 'triangle',
            'line-style': 'dotted'
          }
        }
      ],
      layout: {
        name: 'grid',
        rows: 1
      }
    }); // create an empty graph and define its style
    this.selectedNode = null;

    this.initGraphView();
    this.clickGraph();
  }

  initGraphView() {
    let close = this.closeButton;
    let btnClear = this.btnClear;
    let document = this.document;

    if (close) {
      close.addEventListener("click", () => this.closePopup());
    }

    if (btnClear) {
      btnClear.addEventListener("click", () => this.clearNodeProps());
    }

    if (document) {
      document.addEventListener("keydown", () => this.onKeyDown(event), true);
    }

    document.getElementById("myMenu").style.width = "0px";
  }

  renderGraph(options) {
    let process = options.process;
    let infra = options.infra;

    if (process != undefined) {
      graphcreator.createGraphFromProcess(this.graph, process);
    } else if (infra != undefined) {
      graphcreator.createGraphFromInfra(this.graph, infra);
    }

    this.layoutGraph();

    log.info('graph rendered');
  }

  layoutGraph() {
    let layout = this.graph.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
    layout.run();
    this.graph.autolock(false); //elements can not be moved by the user
    this.graph.reset();//Groesse anpassen
    this.graph.fit();// alle KNoten werden im Container angzeigt
    this.graph.resize();
  }

  closePopup() {
    this.document.getElementById("popGraph").style.left = "-5000px";
  }

  clickGraph() { //weitere Events: http://js.cytoscape.org/#events/user-input-device-events
    let _this = this;

    this.graph.on('tap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element === _this.graph) {
        console.log('tap on background');
        _this.graph.forceRender();
        _this.graph.reset();//Groesse anpassen
        _this.graph.fit();// alle KNoten werden im Container angzeigt
        _this.graph.resize(); //Komplette Container nutzen
      } else {
        if (element.isNode()) {
          console.log('taped on node');
          _this.selectedNode = element;
          _this.clearNodeProps();
          _this.renderNodeProps();
          _this.testquery(element);
        }
        if (element.isEdge()) {
          console.log('taped on edge');
        }
        console.log('tap on some element');
      }
    });
  }

  renderNodeProps() {
    let _this = this;
    let node = _this.selectedNode;
    _this.clearNodeProps();

    _this.nodeId.value = node.id();
    _this.nodeName.textContent = node.data('name');
    gui.renderNodeProps(node, this.nodeProps); //render props in listbox
  }

  clearNodeProps() {
    this.nodeId.value = '';
    this.nodeName.textContent = '';
    gui.clearList(this.nodeProps);
  }

  onKeyDown(event) {
    if (event.which == 27) { //press esc.
      this.closePopup();
    }
  }

  newProject() {
    let graph = this.graph;
    graphcreator.removeModeltypeFromGraph(graph, 'process');
    graphcreator.removeModeltypeFromGraph(graph, 'infra');
    graphcreator.removeModeltypeFromGraph(graph, 'compliance');
    this.clearNodeProps();
  }

  openProject(graph_elements) {
    let graph = this.graph;
    graphcreator.createGraphFromGraphelements(graph, graph_elements);
    this.layoutGraph();
  }

  testquery(element){
    console.log(element);

    console.log('all preds of type')
    console.log(query.getPredecessors(element, 'infra'));

    console.log('all sucs of type')
    console.log(query.getSuccessors(element, 'infra'));
  }

}

module.exports = graphView;
