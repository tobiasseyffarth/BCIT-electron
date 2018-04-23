import log from "../../helpers/logs";
import cytoscape from "cytoscape";

function drawGraph(container){
  let graph = cytoscape({
    container: container,
    elements: [ // list of graph elements to start with
      { // node a
        data: {id: 'a'}
      },
      { // node b
        data: {id: 'b'}
      },
      { // node b
        data: {id: 'c'}
      },
      { // edge ab
        data: {id: 'ab', source: 'a', target: 'b'}
      }
    ],

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

  renderGraph(graph);

  return graph;

}

function renderGraph(g) {
  // creategraph.createGraphFromInfra(this.graph, infraclass.infra);
  let layout = g.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
  g.layout({name: 'breadthfirst'}); //weitere Optionen unter http://js.cytoscape.org/#layouts
  layout.run();
  g.autolock(false); //elements can not be moved by the user
  log.info('graph rendered');

  g.reset();//Groesse anpassen

  g.resize();
  g.fit();// alle KNoten werden im Container angzeigt


  console.log('rendered');
  //this.graphContainer.textContent="hallo welt;"
}




module.exports = {
  drawGraph
};
