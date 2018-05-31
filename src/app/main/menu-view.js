const EventEmitter = require('events');

/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {
  menuButton: "#menu"
};

class menuView extends EventEmitter {
  constructor(options) {
    super();

    if (!options) options = {};
    this.document = options.document;
    this.menuButton = this.document.getElementById('menu');
    this.closeButton = this.document.getElementById('btnClose');
    this.btnGraph = this.document.getElementById('btnGraph');
    this.btnNew=this.document.getElementById('btnNew');
    this.btnOpen=this.document.getElementById('btnOpen');
    this.btnSave=this.document.getElementById('btnSave');

    this.initMenuView();
  }

  initMenuView() {
    let btnMenu = this.menuButton;
    let btnClose = this.closeButton;
    let btnGraph = this.btnGraph;
    let btnNew = this.btnNew;
    let btnOPen = this.btnOpen;
    let btnSave=this.btnSave;

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

    if(btnNew){
      btnNew.addEventListener("click", () => this.newProject());
    }

    if(btnOpen){
      btnOpen.addEventListener("click", () => this.openProject());
    }

    if(btnSave){
      btnSave.addEventListener("click", () => this.saveProject());
    }

    this.document.getElementById("myMenu").style.width = "0px";
  }

  openMenu() {
    this.document.getElementById("myMenu").style.width = "150px";
  }

  closeMenu() {
    this.document.getElementById("myMenu").style.width = "0px";
  }

  openGraphPopup() {
    this.document.getElementById('popGraph').style.left = "0px";
    this.closeMenu();
  }

  newProject(){
    this.emit('newproject', {done: true});
    this.closeMenu();
  }

  openProject(){
    this.emit('openproject', {done: true});
    this.closeMenu();
  }

  saveProject(){
    this.emit('saveproject', {done: true});
    this.closeMenu();
  }
}

module.exports = menuView;
