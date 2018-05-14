module.exports = {
  getNodes,
  getSequences,
  getElementById,
  getMetadata,
  removeITProps,
  updateITProps,
  isUniqueProp
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

//final
function updateITProps(element, property) {
  let requirement = property.requirement;
  let props = element.props;
  let updateProps = true;
  let name = 'compliance';

  if (requirement != null) {
    for (let i in props) {
      if (props[i].name == name && props[i].value == requirement.id) {
        updateProps = false;
        break;
      }
    }

    if (updateProps) { //avoid to insert a duplicate
      props.push({name: name, value: requirement.id});
    }
    return updateProps;
  }
  return false;
}

function isUniqueProp(element, property){
  let requirement = property.requirement;
  let props = element.props;
  let updateProps = true;
  let name='compliance';

  if (requirement != null) {
    for (let i in props) {
      if (props[i].name == name && props[i].value == requirement.id) {
        updateProps = false;
        break;
      }
    }
    return updateProps;
  }
  return false;
}
