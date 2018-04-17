import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "../control/processio";
import loadCompliance from "../data/compliance/loadCompliance";
import log from "./../../helpers/logs";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  xmlUploadButton: "#uploadComplianceXML"
};

class complianceView {
  constructor(options) {
    if (!options) options = {};

    this.document = options.document;
    this.xmlUploadButton = options.xmlUploadButton || baseConfig.xmlUploadButton;
    this.searchRequirement = this.document.querySelector('.input-search-requirement');
    this.listRequirement = this.document.getElementById('select-requirement');
    this.showRequirement = this.document.getElementById('show-requirement');
    this.compliance = null;

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
      this.searchRequirement.addEventListener("keypress", () => this.searchOnEnter(event));
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
    let xml = await processio.readFile('./resources/compliance/bdsg.xml');
    this.compliance =  loadCompliance.getJSON(xml);
    //this.compliance = await loadCompliance.getProm();

    //ToDo: das Compliance-Objekt wird ab hier nicht gefunden --> promise bauen?
    /*
    for(let i in this.compliance){
      let option = new Option();
      option.text=this.compliance.requirement[i].id;
      this.listRequirement.add(option);
    }
*/

    log.info('compliance imported');
    console.log(this.compliance);
    this.fillListRequirement();
  }

  fillListRequirement(compliance) {


    let option = new Option();

    option.text = 'test1';
    this.listRequirement.add(option);

    option = new Option();
    option.text = 'test2';
    this.listRequirement.add(option);

    option = new Option();
    option.text = 'test3';
    this.listRequirement.add(option);

  }

  searchOnEnter(input) {
    log.info('press');
    //ToDo: geht nciht
    /*
    for (let i in this.compliance) {
      let option = new Option();
      option.text = this.compliance.requirement[i].id;
      this.listRequirement.add(option);
    }
    */
    if (event.which == 13) {
      log.info('press enter');
    }
  }

  searchOnClick() {
    log.info('click');
  }

  requirementListOnClick(input) {
    console.log(this.listRequirement.options[this.listRequirement.selectedIndex].text);

    log.info('click list');
  }

}

module.exports = complianceView;
