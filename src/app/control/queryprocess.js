import fs from "fs";

module.exports = {
  getOut,
  readFile
};


function getOut(input) {
  return input;
}

function readFile(url) {
  let content;
  fs.readFile(url, "utf8", function read(err, data) {
    if (err) {
      throw err;
    }
    return data;
  });
}

function writeBpmn(viewer) {
  this.viewer.saveXML({format: true}, function (err, xml) {
    return xml;
  });
}

function readBpmn(filename){

}

