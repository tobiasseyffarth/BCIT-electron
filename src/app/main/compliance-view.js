const EventEmitter = require('events');

import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "../control/processio";
import loadCompliance from "../data/compliance/loadCompliance";
import log from "./../../helpers/logs";
import gui from "./../../helpers/gui";
import querycompliance from "./../control/querycompliance";

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
    this.showRequirement1 = this.document.getElementById('show-requirement1');
    this.showRequirement2 = this.document.getElementById('show-requirement2');
    this.btnLink = this.document.getElementById('btnLinkRequirement');
    this.infraPanel = this.document.getElementById('infra-panel'); //allow drop to emit linking requirement and it component
    this.processPanel = this.document.getElementById('process-panel'); //allow drop to emit linking requirement and flowelement

    this.compliance = null; //stores our compliance model
    this.selectedRequirement = null; //contains the requirement shown in the preview
    this.selectedSourceRequirement = null; //contains the source requirement shown in the left textarea
    this.selectedTargetRequirement = null; //contains the target requirement shown in the right textarea

    this.key=null;
    this.dragEvent = null; //get the source of the drag-event

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

    if (this.listRequirement) {
      this.listRequirement.addEventListener("click", () => this.showRequirement(this.previewRequirement));
    }

    if (this.previewRequirement) {
      this.previewRequirement.addEventListener("drag", () => this.previewRequirementOnDrag(event));
      this.previewRequirement.addEventListener("click", () => this.analyzeRequirement());
    }

    if (this.showRequirement1) {
      this.showRequirement1.addEventListener("dragover", () => this.allowDrop(event));
      this.showRequirement1.addEventListener("drop", () => this.showRequirementOnDrop(event, this.dragEvent));
    }

    if (this.showRequirement2) {
      this.showRequirement2.addEventListener("dragover", () => this.allowDrop(event));
      this.showRequirement2.addEventListener("drop", () => this.showRequirementOnDrop(event, this.dragEvent));
    }

    if (this.btnLink) {
      this.btnLink.addEventListener("click", () => this.linkRequirements());
    }

    if (this.infraPanel) {
      this.infraPanel.addEventListener("dragover", () => this.allowDrop(event));
      this.infraPanel.addEventListener("drop", () => this.onDropInfrapanel(event, this.dragEvent));
    }

    if (this.processPanel) {
      this.processPanel.addEventListener("dragover", () => this.allowDrop(event));
      this.processPanel.addEventListener("drop", () => this.onDropProcesspanel(event, this.dragEvent));
    }

    if (this.document) {
      this.document.addEventListener("keydown", () => this.onKeyDown(event), true);
      this.document.addEventListener("keyup", () => this.onKeyUp(event), true);
    }
  }

  async xmlUploadOnClick() {
    //let data = dialogHelper.xmlFileOpenDialog();
    let xml = await processio.readFile('./resources/compliance/gdpr.json');
    this.compliance = loadCompliance.getJSON(xml);

    this.renderListRequirement(this.compliance);
    log.info('compliance imported');
    this.emit('compliance_rendered', {done: true});
  }

  renderListRequirement(compliance) {
    if (compliance != null) {
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
  }

  searchOnEnter(event) {
    let search = this.searchRequirement.value;
    let compliance = this.compliance;

    if (search.length > 0) {
      gui.clearList(this.listRequirement);
      let result = [];
      result = querycompliance.getRequirementContainsText(compliance.requirement, search);
      this.renderListRequirement(result);
    } else {
      gui.clearList(this.listRequirement);
      this.renderListRequirement(compliance);
    }
  }

  showRequirement(textarea) {
    let compliance = this.compliance;
    let list = this.listRequirement;

    if (list.selectedIndex > -1) {
      let id = list.options[list.selectedIndex].text;
      textarea.value = querycompliance.toString(compliance.requirement, id);
      this.selectedRequirement = querycompliance.getRequirementById(compliance.requirement, id);
    }
  }

  previewRequirementOnDrag(ev) {
    this.dragEvent = ev;
  }

  analyzeRequirement() {
    let key = this.key;
    if (key === 17 || key === 18) {
      let id = this.selectedRequirement.id;
      this.emit('analyze', {done: true, id: id, key: key});
    }
  }

  showRequirementOnDrop(ev, dragEv) {
    ev.preventDefault();
    let dragSource = dragEv.target.id;

    if (dragSource == this.previewRequirement.id) {
      this.dragEvent = null;

      let target = this.document.getElementById(ev.target.id); // get HTML Element
      let id = this.listRequirement.options[this.listRequirement.selectedIndex].text;
      let compliance = this.compliance;

      this.showRequirement(target); //show the requirement in the appropriate textarea

      if (target.id == this.showRequirement1.id) { //when selectedRequirement was dropped on the left textarea
        this.selectedSourceRequirement = querycompliance.getRequirementById(compliance.requirement, id);
      } else if (target.id == this.showRequirement2.id) { //when selectedRequirement was dropped on the right textarea
        this.selectedTargetRequirement = querycompliance.getRequirementById(compliance.requirement, id);
      }
    }
  }

  allowDrop(ev) {
    ev.preventDefault();
  }

  linkRequirements() {
    let source = this.selectedSourceRequirement;
    let target = this.selectedTargetRequirement;

    if (source != null && target != null) {
      this.emit('link_requirement-requirement', {done: true});
      this.showRequirement1.value = "";
      this.showRequirement2.value = "";
      source = null;
      target = null;
    }
  }

  onDropInfrapanel(ev, dragEv) {
    ev.preventDefault();

    if (dragEv != null) {
      let dragSource = dragEv.target.id;

      if (dragSource == this.previewRequirement.id) {
        this.dragEvent = null; //sichertstellen, dass nicht das Propertyfenster hier rein gezogen wird.
        this.emit('link_requirement-infra', {done: true});
      }
    }
  }

  onDropProcesspanel(ev, dragEv) {
    ev.preventDefault();

    if (dragEv != null) {
      let dragSource = dragEv.target.id;

      if (dragSource == this.previewRequirement.id) {
        this.dragEvent = null; //sichertstellen, dass nicht das Propertyfenster hier rein gezogen wird. //ToDo: wie kann das besser gehen?
        this.emit('link_requirement-process', {done: true});
      }
    }
  }

  onKeyDown(event) {
    this.key = event.which;
  }

  onKeyUp(event) {
    this.key = null;
  }

  newProject() {
    this.compliance = null;
    this.searchRequirement.value = "";
    this.previewRequirement.value = "";
    this.showRequirement1.value = "";
    this.showRequirement2.value = "";
    gui.clearList(this.listRequirement);
  }

  openProject(compliance) {
    this.newProject();
    this.renderListRequirement(compliance);
    this.compliance = compliance;
  }

}

module.exports = complianceView;

