import log from "./../../helpers/logs";
import graphcreator from "../control/creategraph";
import cytoscape from "cytoscape";

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

    this.graph = cytoscape({
      container: this.graphContainer,
      style: [ // the stylesheet for the graph
        {
          selector: 'node',
          style: {
            'background-color': 'blue',
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

    this.clickGraph();
  }

  showAnalyze(graph_data, heading) {
    this.graph_data = graph_data;
    this.heading.textContent=heading;

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
    let layout = this.graph.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
    layout.run();

    this.graph.autolock(false); //elements can not be moved by the user
    this.graph.reset();//Groesse anpassen
    this.graph.fit();// alle KNoten werden im Container angzeigt
    this.graph.resize();
    this.styleNodes();
    this.styleEdges();
    this.drawGraph();

    log.info('graph rendered');
  }

  styleNodes() {
    let nodes = this.graph.nodes();

    for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if (node.data('nodestyle') == 'directdemand') {
        node.style('background-color', 'green');
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

  drawGraph() {
    let changed_node = this.graph.nodes().filter('node[nodestyle = "changedElement"]')[0];
    let pred = changed_node.predecessors().filter('node');
    changed_node.position({x: 270, y: 150});

    // 1. get dir Pred of changedElement

    // 2. determine wether complaince or not

    // determine dir. pred of pred in helper --> dir_pred=helper


    let x = changed_node.position('x');
    let y = changed_node.position('y');
    console.log(x, y);


    for (let i = 0; i < pred.length; i++) {
      let pred_node = pred[i];
      let y = changed_node.position('y') + (i + 1) * 60;

      pred_node.position({x: x, y: y});
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
          console.log('taped on node');
          _this.selectedNode = element;

          console.log(element.data());
          console.log(element.position());
          console.log(element.width());
          console.log(element.height());

          _this.renderNodeProps();
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
    let element = _this.selectedNode;

    _this.nodeId.value = element.id();
    _this.nodeName.textContent = element.data('name');
    _this.nodeProps.textContent = 'type: ' + element.data('nodetype') + ', ';

    let props = element.data('props');
    if (props != undefined) {
      if (props.length > 0) { //getElementProperties and display in ProperyPanel
        for (let i in props) {
          _this.nodeProps.textContent = _this.nodeProps.textContent + '\n' + props[i].name + ": " + props[i].value;
        }
      }
    }
  }

  clearNodeProps() {
    this.nodeId.value = '';
    this.nodeName.textContent = '';
    this.nodeProps.textContent = '';
  }
}

module.exports = analyzeView;
