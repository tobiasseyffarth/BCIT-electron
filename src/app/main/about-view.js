/*****
 * Basic config
 * used when nothing else is given to constructor
 */
const baseConfig = {

};

class aboutView {
  constructor(options) {
    if (!options) options = {};
    this.document = options.document;
    this.closeButton = this.document.getElementById('btnClosePopAbout');
    this.initAnalyzeView();
  }

  initAnalyzeView() {
    let close = this.closeButton;
    let document = this.document;

    if (close) {
      close.addEventListener("click", () => this.closePopup());
    }

    if (document) {
      document.addEventListener("keydown", () => this.onKeyDown(event), true);
    }
  }

  showPopup() {
    //this.document.getElementById('popAnalyze').style.marginLeft = "150px";
    this.document.getElementById('popAbout').style.left = "0px";
  }

  closePopup() {
    this.document.getElementById("popAbout").style.left = "-5000px";
  }

  onKeyDown(event){
    if(event.which==27){ //press esc.
      this.closePopup();
    }
  }
}

module.exports = aboutView;
