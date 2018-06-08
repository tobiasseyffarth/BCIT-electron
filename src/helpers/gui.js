module.exports = {
  clearList,
  renderExtensionProps,
  renderInfraProps,
  renderNodeProps
}

function clearList(list) {

  do {
    for (let i = 0; i < list.length; i++) {
      list.remove(i);
    }
  } while (list.length > 0);

}

function renderExtensionProps(props, list) {
  if (props != undefined || props != null) {
    if (props.length > 0) { //getElementProperties and display in ProperyPanel
      for (let i in props) {
        let option = new Option();
        option.text = props[i].name + ': ' + props[i].value;
        list.add(option);
      }
    }
  }
}

function renderInfraProps(props, list) {
  if (props != undefined || props != null) {
    if (props.length > 0) { //getElementProperties and display in ProperyPanel
      for (let i in props) {
        let option = new Option();
        option.text = props[i].name + ': ' + props[i].value;
        list.add(option);
      }
    }
  }
}

function renderNodeProps(node, list) {
  let props = node.data('props');
  let option = new Option();

  option.text = 'modeltype: ' + node.data('modeltype'); //add modeltype to properties
  list.add(option);

  option = new Option();
  option.text = 'nodetype: ' + node.data('nodetype'); // add nodetype to properties
  list.add(option);

  if (props != undefined) { //nodes of process propabily have no props
    if (props.length > 0) { //add props tp properties
      for (let i in props) {
        option = new Option();
        option.text = props[i].name + ': ' + props[i].value;
        list.add(option);
      }
    }
  }
}

