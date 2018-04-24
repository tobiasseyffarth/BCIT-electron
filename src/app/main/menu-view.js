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
    let menu = this.menuButton;
    let close = this.closeButton;
    let btnGraph = this.btnGraph;
    if (menu) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      menu.addEventListener("click", () => this.openMenu());
    }

    if (close) {
      close.addEventListener("click", () => this.closeMenu());
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
    log.info('click');

    this.document.getElementById("popGraph").style.width = "70%";
    this.document.getElementById("popGraph").style.heigth = "100%";
    this.document.getElementById('popGraph').style.marginLeft = "150px";
    this.document.getElementById('popGraph').style.left = "0px";
    this.document.querySelector('.ctrls').style.marginLeft = "500px";
    this.document.querySelector('.container-process').style.marginLeft = "500px";
    this.document.querySelector('.sub-container').style.marginLeft = "500px";
    this.document.querySelector('.container-log').style.marginLeft = "500px";

    this.closeMenu();
  }

}

module.exports = menuView;
