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

class analyzeView {
  constructor(options) {
    if (!options) options = {};
    this.document = options.document;
    this.graph_data = options.graph;

    this.graphContainer = this.document.getElementById('graph-io-analyze');
    this.closeButton = this.document.getElementById('btnClosePopAnalyze');
    this.heading = this.document.getElementById('heading-analyze');
    this.btnClear = this.document.getElementById('btnClear-analyze');
    this.nodeName = this.document.getElementById('analyze-node-name'); // get Textfield from Propertypanel Infra
    this.nodeId = this.document.getElementById('analyze-node-id'); // get ID-Field from Propertypanel Infra
    this.nodeProps = this.document.getElementById('analyze-node-props'); // get Props-Field from Propertypanel Infra
    this.legend = this.document.getElementById('legendanalyze');

    this.graph = cytoscape({
      container: this.graphContainer,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': 'white',
            'border-style': 'solid',
            'border-color': 'black',
            'border-width': 1,
            'label': 'data(display_name)',
            'font-size': 10,
            'text-wrap': 'wrap',
            'text-max-width': 20,
            'shape': 'rectangle'
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

    this.initAnalyzeView();
  }

  initAnalyzeView() {
    let close = this.closeButton;

    if (close) {
      close.addEventListener("click", () => this.closePopup());
    }

    if (this.btnClear) {
      this.btnClear.addEventListener("click", () => this.clearNodeProps());
    }

    if (this.document) {
      this.document.addEventListener("keydown", () => this.onKeyDown(event), true);
    }

    this.clickGraph();

    let legend = this.legend;
    legend.src = './../app/resources/picture/legendAnalyze.jpg';
  }

  showAnalyze(graph_data, heading) {
    this.graph_data = graph_data;
    this.heading.textContent = heading;

    this.showPopup();
    this.clearGraph();
    this.copyGraphElements();
    this.renderGraph();
  }

  showPopup() {
    //this.document.getElementById('popAnalyze').style.marginLeft = "150px";
    this.document.getElementById('popAnalyze').style.left = "0px";
  }

  renderGraph() {
    this.graph.autolock(false); //elements can not be moved by the user

    this.styleNodes();
    this.styleEdges();

    rendergraph.drawAnalyze(this.graph);
    rendergraph.resizeGraph(this.graph);
  }

  styleNodes() {
    let nodes = this.graph.nodes();

    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      let nodestyle = node.data('nodestyle');
      let nodetype = node.data('nodetype');

      if (nodestyle === 'directdemand') {
        node.style('border-color', 'green');
      } else if (nodestyle === 'indirectdemand') {
        node.style('border-color', 'green');
      } else if (nodestyle === 'obsolete') {
        node.style('border-color', 'blue');
      } else if (nodestyle === 'violated') {
        node.style('border-color', 'red');
      } else if (nodestyle === 'changedElement') {
        node.style('border-color', 'orange');
      } else if (nodestyle === 'between') {
        node.style('border-color', 'grey');
      }

      if (nodetype === 'infra') {
        node.style('shape', 'triangle');
      } else if (nodetype === 'businessprocess') {
        node.style('shape', 'roundrectangle');
      } else if (nodetype === 'compliance') {
        node.style('shape', 'rectangle');
      } else if (nodetype === 'complianceprocess') {
        node.style('shape', 'roundrectangle');
        node.style('background-color', 'grey');
      }
    }
  }

  styleEdges() {
    let edges = this.graph.edges();

    for (let i = 0; i < edges.length; i++) {
      let edge = edges[i];
      if (edge.data('edgestyle') == 'direct') {
        edge.style('line-style', 'solid');
      }
    }
  }

  clearGraph() {
    let graph = this.graph;
    let nodes = graph.nodes();
    let edges = graph.edges();

    for (let i = 0; i < edges.length; i++) { //first remove edges
      edges[i].remove();
    }

    for (let i = 0; i < nodes.length; i++) { //second remove nodes
      nodes[i].remove();
    }
  }

  copyGraphElements() {
    let graph = this.graph;
    let graph_data = this.graph_data;
    let nodes = graph_data.nodes();
    let edges = graph_data.edges();

    for (let i = 0; i < nodes.length; i++) {
      graph.add(nodes[i]);
    }

    for (let i = 0; i < edges.length; i++) {
      graph.add(edges[i]);
    }
  }

  closePopup() {
    this.document.getElementById("popAnalyze").style.left = "-5000px";
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
          //console.log('taped on node');
          _this.selectedNode = element;
          _this.clearNodeProps();
          _this.renderNodeProps();
        }
        if (element.isEdge()) {
          console.log('taped on edge');
        }
        console.log('tap on some element');
      }
    });

    _this.graph.on('cxttap', function (evt) { //http://js.cytoscape.org/#core/events
      let element = evt.target;
      if (element === _this.graph) {
        rendergraph.resizeGraph(_this.graph);
      }
    });
  }

  renderNodeProps() {
    let _this = this;
    let node = _this.selectedNode;

    _this.nodeId.value = node.id();
    _this.nodeName.textContent = node.data('name');
    gui.renderNodeProps(node, this.nodeProps); //render props in listbox
  }

  clearNodeProps() {
    this.nodeId.value = '';
    this.nodeName.textContent = '';
    //this.nodeProps.textContent = '';
    gui.clearList(this.nodeProps);
  }

  onKeyDown(event) {
    if (event.which == 27) { //press esc.
      this.closePopup();
    }
  }
}

module.exports = analyzeView;
