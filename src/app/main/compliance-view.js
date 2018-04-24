const EventEmitter = require('events');

import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "../control/processio";
import loadCompliance from "../data/compliance/loadCompliance";
import log from "./../../helpers/logs";
import gui from "./../../helpers/gui";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  xmlUploadButton: "#uploadComplianceXML"
};

class complianceView extends EventEmitter {
  constructor(options) {
    super();
    if (!options) options = {};

    this.document = options.document;
    this.xmlUploadButton = options.xmlUploadButton || baseConfig.xmlUploadButton;
    this.searchRequirement = this.document.querySelector('.input-search-requirement');
    this.listRequirement = this.document.getElementById('select-requirement');
    this.previewRequirement = this.document.getElementById('preview-requirement');

    this.compliance = null; //stores our compliance model
    this.selectedElement = null; //todo: beim Verbinden der Graphen verwenden

    this.initComplianceView();
  }

  initComplianceView() {
    //File open Dialog anlegen. Ausgewählte Datei wird dann dem Viewer zugeführt
    let uploadBpmn = this.document.querySelector(this.xmlUploadButton);
    if (uploadBpmn) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      uploadBpmn.addEventListener("click", () => this.xmlUploadOnClick());
    }

    if (this.searchRequirement) {
      this.searchRequirement.addEventListener("keyup", () => this.searchOnEnter(event));
    }

    if (this.searchRequirement) {
      this.searchRequirement.addEventListener("click", () => this.searchOnClick('click'));
    }

    if (this.listRequirement) {
      this.listRequirement.addEventListener("click", () => this.requirementListOnClick('click'));
    }
  }

  async xmlUploadOnClick() {
    //let data = dialogHelper.xmlFileOpenDialog();
    let xml = await processio.readFile('./resources/compliance/hgb.xml');
    this.compliance = loadCompliance.getJSON(xml);

    this.renderComplianceXml();
    log.info('compliance imported');
    this.emit('compliance_rendered', {done: true});
  }

  renderComplianceXml() {
    let compliance = this.compliance;

    if (compliance.requirement != undefined) {
      for (let i in compliance.requirement) {
        let option = new Option();
        option.text = compliance.requirement[i].id;
        this.listRequirement.add(option);
      }
    }

    if (compliance.length > 0) {
      for (let i in compliance) {
        let option = new Option();
        option.text = compliance[i].id;
        this.listRequirement.add(option);
      }
    }
  }

  addListRequirement(compliance) {
    if (compliance.requirement != undefined) {
      for (let i in compliance.requirement) {
        let option = new Option();
        option.text = compliance.requirement[i].id;
        this.listRequirement.add(option);
      }
    }

    if (compliance.length > 0) {

      for (let i in compliance) {
        let option = new Option();
        option.text = compliance[i].id;
        this.listRequirement.add(option);
      }
    }
  }

  searchOnEnter(event) {
    let search = this.searchRequirement.value;
    let compliance = this.compliance;

    if (search.length > 0) {
      gui.clearList(this.listRequirement);
      let result = [];
      result = compliance.getRequirementContainsText(search);
      this.addListRequirement(result);
    } else {
      gui.clearList(this.listRequirement);
      this.addListRequirement(compliance);
    }
  }

  searchOnClick() {
    log.info('click');
  }

  requirementListOnClick(input) {
    let compliance = this.compliance;
    let id;
    //ToDO: Abgreifen, wenn die Liste leer ist
    id = this.listRequirement.options[this.listRequirement.selectedIndex].text;
    this.previewRequirement.value = compliance.toString(id);
  }
}

module.exports = complianceView;
