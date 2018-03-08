'use strict';

const inherits = require('inherits');
const PropertiesActivator = require('bpmn-js-properties-panel/lib/PropertiesActivator');

/*
const processProps = require('./parts/ProcessProps'),
  eventProps = require('./parts/EventProps'),
  linkProps = require('./parts/LinkProps'),
  documentationProps = require('./parts/DocumentationProps'),
  idProps = require('./parts/IdProps'),
  nameProps = require('./parts/NameProps'),
  executableProps = require('./parts/ExecutableProps');
*/

const idProps     = require('bpmn-js-properties-panel/lib/provider/bpmn/parts/IdProps');

function createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate) {
  /*
  let generalGroup = {
    id: 'general',
    label: translate('General'),
    entries: []
  };
  idProps(generalGroup, element, translate);
  nameProps(generalGroup, element, translate);
  processProps(generalGroup, element, translate);
  executableProps(generalGroup, element, translate);

  let detailsGroup = {
    id: 'details',
    label: translate('Details'),
    entries: []
  };
  linkProps(detailsGroup, element, translate);
  eventProps(detailsGroup, element, bpmnFactory, elementRegistry, translate);


  let documentationGroup = {
    id: 'documentation',
    label: translate('Documentation'),
    entries: []
  };

  documentationProps(documentationGroup, element, bpmnFactory, translate);
  */

  let compliance = {
    id: 'complianceGrp',
    label: translate('ComplianceGrp'),
    entries: []
  };

  idProps(compliance, element, translate);

  return [
    compliance
  ];

}

function TobusPropertiesProvider(eventBus, bpmnFactory, elementRegistry, translate) {

  PropertiesActivator.call(this, eventBus);

  this.getTabs = function(element) {

    /*
    let generalTab = {
      id: 'general',
      label: translate('General'),
      groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate)
    };
    */

    let complianceTab = {
      id: 'compliance',
      label: translate('Compliance'),
      groups: createGeneralTabGroups(element, bpmnFactory, elementRegistry, translate)
    };

    return [
      complianceTab,
      //generalTab
    ];
  };
}

TobusPropertiesProvider.$inject = [ 'eventBus', 'bpmnFactory', 'elementRegistry', 'translate' ];

inherits(TobusPropertiesProvider, PropertiesActivator);

module.exports = {
  __init__: [ 'propertiesProvider' ],
  propertiesProvider: [ 'type', TobusPropertiesProvider ]
};

