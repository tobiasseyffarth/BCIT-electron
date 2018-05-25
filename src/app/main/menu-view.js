import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "../control/processio";
import loadCompliance from "../data/compliance/loadCompliance";
import log from "./../../helpers/logs";
import graphView from "./graph-view";

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  menuButton: "#menu"
};

class menuView {
  constructor(options) {
    if (!options) options = {};
    this.document = options.document;
    this.menuButton = this.document.getElementById('menu');
    this.closeButton = this.document.getElementById('btnClose');
    this.btnGraph = this.document.getElementById('btnGraph');
    this.initMenuView();
  }

  initMenuView() {
    let btnMenu = this.menuButton;
    let btnClose = this.closeButton;
    let btnGraph = this.btnGraph;

    if (btnMenu) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      btnMenu.addEventListener("click", () => this.openMenu());
    }

    if (btnClose) {
      btnClose.addEventListener("click", () => this.closeMenu());
    }

    if (btnGraph) {
      btnGraph.addEventListener("click", () => this.openGraphPopup());
    }
    this.document.getElementById("myMenu").style.width = "0px";
  }

  openMenu() {
    this.document.getElementById("myMenu").style.width = "150px";
    this.document.querySelector('.ctrls').style.marginLeft = "150px";
    this.document.querySelector('.container-process').style.marginLeft = "150px";
    this.document.querySelector('.sub-container').style.marginLeft = "150px";
    this.document.querySelector('.container-compliance').style.marginLeft = "150px";
    this.document.querySelector('.container-log').style.marginLeft = "150px";
  }

  closeMenu() {
    this.document.getElementById("myMenu").style.width = "0px";
    this.document.querySelector('.ctrls').style.marginLeft = "0px";
    this.document.querySelector('.container-process').style.marginLeft = "0px";
    this.document.querySelector('.sub-container').style.marginLeft = "0px";
    this.document.querySelector('.container-compliance').style.marginLeft = "0px";
    this.document.querySelector('.container-log').style.marginLeft = "0px";
  }

  openGraphPopup() { //toDo: Popup einbauen
    //this.document.getElementById('popGraph').style.marginLeft = "150px";
    this.document.getElementById('popGraph').style.left = "0px";

    this.closeMenu();
  }

}

module.exports = menuView;
