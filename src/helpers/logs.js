let info = console.info,
  error = console.error,
  log = console.log;

let logbox = document.querySelector('.log-content');

module.exports = {
  info: function (txt) {
    let old = logbox.value;
    logbox.value=new Date().toJSON() + ": " + txt + "\n" + old;
  }
};
