let convert = require('xml-js');

module.exports = {
  getJSON
}

let infra = {
  id: undefined,
  name: undefined,
  schema: undefined,
  title: undefined,
  creator: undefined,
  elements: [],
  relations: [],
  getElement: function (id) {
    for (let i in this.elements) {
      if (id === this.elements[i].id) {
        return this.elements[i];
      }
    }
  },
  getSuccessor: function (element) {
    let result = [];
    for (let i in this.relations) {
      if (this.relations[i].source === element.id) {
        result.push(this.getElement(this.relations.target));
      }
    }
    return result;
  },
  getPredecessor: function (element) {
    let result = [];
    for (let i in this.relations) {
      if (this.relations[i].target === element.id) {
        result.push(this.getElement(this.relations.source));
      }
    }
    return result;
  }

};

class element {
  constructor() {
    this.id = undefined;
    this.name = undefined;
    this.type = undefined;
    this.attribute = undefined;
  }
}

class relation {
  constructor() {
    this.id = undefined;
    this.source = undefined;
    this.target = undefined;
    this.type = undefined;
  }

}

function getJSON(xml) {
  let myObj = Object.assign({}, infra);
  let helpObj = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 2}));

  writeMetadata(myObj, helpObj);
  writeElement(myObj, helpObj);
  writeRelation(myObj, helpObj);

  return myObj;
}

function writeMetadata(myObj, helpObj) {
  myObj.id = helpObj.model._attributes.identifier;
  myObj.name = helpObj.model.name._text;
  myObj.schema = helpObj.model.metadata.schema._text;
  myObj.title = helpObj.model.name._text;
  myObj.creator = helpObj.model.metadata;
}

function writeElement(myObj, helpObj) {
  for (i in helpObj.model.elements.element) {
    let e = new element();
    e.id = helpObj.model.elements.element[i]._attributes.identifier;
    e.name = helpObj.model.elements.element[i].name._text;
    e.type = helpObj.model.elements.element[i]._attributes["xsi:type"];
    e.attribute = helpObj.model.elements.element[i].properties;

    myObj.elements.push(e);
  }
}

function writeRelation(myObj, helpObj) {
  for (i in helpObj.model.relationships.relationship) {
    let r = new relation();
    r.id = helpObj.model.relationships.relationship[i]._attributes.identifier;
    r.source = helpObj.model.relationships.relationship[i]._attributes.source;
    r.target = helpObj.model.relationships.relationship[i]._attributes.target;
    r.type = helpObj.model.relationships.relationship[i]._attributes['xsi:type'];

    myObj.relations.push(r);
  }
}
