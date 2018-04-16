import processio from "../../control/processio";

var fastXmlParser = require('../../../helpers/fast-xml-parser');

let elements = [];

function getInfra(data) {
  var jsonObj = fastXmlParser.parse(data, {
    attrPrefix: "@_",
    attrNodeName: "attr",
    textNodeName: "#text",
    ignoreTextNodeAttr: false,
    ignoreNonTextNodeAttr: false,
    textAttrConversion: true
  });

  getAttributeRelations(jsonObj);
  getSequenceFlows(jsonObj);
  getArchiElements(jsonObj);
  getMetadata(jsonObj);
  return elements;
}

async function loadXml(url) {
  if (!url) url = './resources/it-architecture/architecture.xml';
  let data = await processio.readFile(url);
  var jsonObj = fastXmlParser.parse(data, {
    attrPrefix: "@_",
    attrNodeName: "attr",
    textNodeName: "#text",
    ignoreTextNodeAttr: false,
    ignoreNonTextNodeAttr: false,
    textAttrConversion: true
  });
  //getArchiElements(jsonObj);

  //var tObj = fastXmlParser.getTraversalObj(data,options);
  //jsonObj = fastXmlParser.convertToJson(tObj);
  getAttributeRelations(jsonObj);
  getArchiElements(jsonObj);
  getSequenceFlows(jsonObj);
}

function getMetadata(archiObject){
  let id =archiObject.model.attr["@_identifier"];
  let name = archiObject.model.name["#text"];

  elements.push({id: id, name: name, type: 'metadata'});
}

function getArchiElements(archiObject) {
  if (!archiObject)
    throw "Empty Archimate XML";

  let elems = archiObject.model.elements.element;
  for (let i = -1; ++i < elems.length;) {
    let elem = elems[i];
    let name = elem.name["#text"];
    let id = elem.attr["@_identifier"];

    let props = [];
    if (elem.properties) {
      for (let k = -1; ++k < elem.properties.property.length;) {
        let p = elem.properties.property[k];
        let propid = p.attr["@_propertyDefinitionRef"];
        props.push({
          id: propid,
          value: p.value["#text"],
          name: propDefintions[propid]
        });
      }
    }
    elements.push({id, name, props, type: "node"});
  }
}

let propDefintions = {};

function getAttributeRelations(obj) {
  let attrRels = obj.model.propertyDefinitions.propertyDefinition;

  for (let i = -1; ++i < attrRels.length;) {
    let attrRel = attrRels[i];
    let propid = "";
    // console.log(attrRel.attr);
    if (attrRel.attr)
      propid = attrRel.attr["@_identifier"];

    propDefintions[propid] = attrRel.name;
  }

  // console.log("props", propDefintions);
}

let sequenceFlows = [];

function getSequenceFlows(obj) {
  let rels = obj.model.relationships.relationship;
  for (let i = -1; ++i < rels.length;) {
    let rel = rels[i];

    let props = [];
    if (rel.properties) {
      for (let k = -1; ++k < rel.properties.property.length;) {
        let p = rel.properties.property[k];
        let propid = p.attr["@_propertyDefinitionRef"];
        props.push({
          id: propid,
          value: p.value["#text"],
          name: propDefintions[propid]
        });
      }
    }

    sequenceFlows.push({
      id: rel.attr["@_identifier"],
      source: rel.attr["@_source"],
      target: rel.attr["@_target"],
      type: "sequence",
      props
    });
  }

  Object.assign(elements, sequenceFlows);
}

// when a tag has attributes
var options = {
  attrPrefix: "@_",
  attrNodeName: false,
  textNodeName: "#text",
  ignoreNonTextNodeAttr: true,
  ignoreTextNodeAttr: true,
  ignoreNameSpace: true,
  ignoreRootElement: false,
  textNodeConversion: true,
  textAttrConversion: false,
  arrayMode: false
};

module.exports = {
  getInfra
};
