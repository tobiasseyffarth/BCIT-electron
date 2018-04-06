let info = console.info,
  error = console.error,
  log = console.log;

let logbox = document.querySelector('.log-content');

module.exports = {
  info: function (txt) {
    logbox.value += "\n" + new Date().toJSON() + ": " + txt;
  }
};
