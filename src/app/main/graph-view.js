import log from "./../../helpers/logs";
import graphcreator from "../control/creategraph";
import cytoscape from "cytoscape";
import gui from "./../../helpers/gui";
import rendergraph from "./../control/rendergraph";

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
    this.graphContainer = this.document.getElementById('graph-io');
    this.closeButton = this.document.getElementById('btnClosePopGraph');
    this.btnClear = this.document.getElementById('btnClear-graph');
    this.nodeName = this.document.getElementById('node-name'); // get Textfield from Propertypanel Infra
    this.nodeId = this.document.getElementById('node-id'); // get ID-Field from Propertypanel Infra
    this.nodeProps = this.document.getElementById('node-props'); // get Props-Field from Propertypanel Infra
    this.legend = this.document.getElementById('legendgraph');

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
    let legend = this.legend;

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

    legend.src = './../app/resources/picture/legendGraph.jpg';
  }

  renderGraph(options) {
    let process = options.process;
    let infra = options.infra;

    if (process !== undefined) {
      graphcreator.createGraphFromProcess(this.graph, process);
    } else if (infra !== undefined) {
      graphcreator.createGraphFromInfra(this.graph, infra);
    }

    this.layoutGraph();
    this.colorNodes();
    //log.info('graph rendered');
  }

  layoutGraph() {
    let layout = this.graph.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
    layout.run();
    rendergraph.resizeGraph(this.graph);
  }

  colorNodes() {
    let nodes = this.graph.nodes();

    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      let nodetype = node.data('nodetype');

      if (nodetype === 'businessprocess') {
        node.style('border-color', 'green');
      } else if (nodetype === 'complianceprocess') {
        node.style('border-color', 'blue');
      } else if (nodetype === 'compliance') {
        node.style('border-color', 'grey');
      } else if (nodetype === 'infra') {
        node.style('border-color', 'orange');
      }
    }
  }

  closePopup() {
    this.document.getElementById("popGraph").style.left = "-5000px";
  }

  openPopup() {
    this.document.getElementById("popGraph").style.left = "0px";
    this.layoutGraph();
    this.colorNodes();
  }

  clickGraph() { //weitere Events: http://js.cytoscape.org/#events/user-input-device-events
    let _this = this;

    this.graph.on('tap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element === _this.graph) {
        //console.log('tap on background');
        _this.clearNodeProps();
      } else {
        if (element.isNode()) {
          //console.log('taped on node');
          _this.selectedNode = element;
          _this.clearNodeProps();
          _this.renderNodeProps();
        }
        if (element.isEdge()) {
          //console.log('taped on edge');
        }
        //console.log('tap on some element');
      }
    });

    this.graph.on('cxttap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element === _this.graph) {
        rendergraph.resizeGraph(_this.graph);
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

}

module.exports = graphView;
