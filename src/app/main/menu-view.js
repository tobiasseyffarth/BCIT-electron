import dialogHelper from "./../../helpers/fileopen_dialogs";
import processio from "../control/processio";
import loadCompliance from "../data/compliance/loadCompliance";
import log from "./../../helpers/logs";

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
    this.initMenuView();
  }

  initMenuView() {
    let menu = this.menuButton;
    let close = this.closeButton;
    if (menu) {
      //arrow function expression (fat arrow function) for binding this (class itself) to the event listener
      menu.addEventListener("click", () => this.openMenu());
    }

    if (close) {
      close.addEventListener("click", () => this.closeMenu());
    }
    this.document.getElementById("myMenu").style.width = "0px";
  }

  openMenu() {
    this.document.getElementById("myMenu").style.width = "150px";
    this.document.querySelector('.ctrls').style.marginLeft = "150px";
    this.document.querySelector('.container-process').style.marginLeft = "150px";
    this.document.querySelector('.sub-container').style.marginLeft = "150px";
    this.document.querySelector('.container-log').style.marginLeft = "150px";
  }

  closeMenu() {
    this.document.getElementById("myMenu").style.width = "0px";
    this.document.querySelector('.ctrls').style.marginLeft = "0px";
    this.document.querySelector('.container-process').style.marginLeft = "0px";
    this.document.querySelector('.sub-container').style.marginLeft = "0px";
    this.document.querySelector('.container-log').style.marginLeft = "0px";
  }

}

module.exports = menuView;
