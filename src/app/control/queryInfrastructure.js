module.exports = {
  getNodes,
  getSequences,
  getElementById,
  getMetadata,
  removeITProps
};

//final
function getNodes(infra) {
  let result = [];
  for (let i in infra) {
    if (infra[i].type == 'node') {
      result.push(infra[i]);
    }
  }
  return result;
}

//final
function getSequences(infra) {
  let result = [];
  for (let i in infra) {
    if (infra[i].type == 'sequence') {
      result.push(infra[i]);
    }
  }
  return result;
}

//final
function getElementById(infra, id) {
  for (let i in infra) {
    if (infra[i].id == id) {
      return infra[i];
    }
  }
}

//final
function getMetadata(infra) {
  for (let i in infra) {
    if (infra[i].type == 'metadata') {
      return infra[i];
    }
  }
}

//final
function removeITProps(element, index) {
  let props = element.props;
  props.splice(index, 1);
}
