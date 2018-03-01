import dialogHelper from "./../../helpers/fileopen_dialogs";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  xmlUploadButton: "#uploadComplianceXML"
};

class complianceView{
  constructor(options){
    if(!options) options = {};

    this.document         = options.document;
    this.xmlUploadButton = options.xmlUploadButton || baseConfig.xmlUploadButton;

    this.initComplianceView();
  }

  initComplianceView(){
    //File open Dialog anlegen. Ausgewählte Datei wird dann dem Viewer zugeführt
    let uploadBpmn = this.document.querySelector(this.xmlUploadButton);
    if(uploadBpmn){
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      uploadBpmn.addEventListener("click", () => this.xmlUploadOnClick());
    }
  }

  xmlUploadOnClick(){
    let data = dialogHelper.xmlFileOpenDialog();
    console.log("xml upload clicked");
    console.log(data);
  }
}

module.exports = complianceView;
