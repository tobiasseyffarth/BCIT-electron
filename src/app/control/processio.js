import fs from "fs";

module.exports = {
  readFile
};

function readFile(url) {
  return new Promise((res, rej) => {
      fs.readFile(url, 'utf-8', function (err, data) {
        if(err) rej(err);

        res(data);
      });
    });
}

function writeBpmn(viewer) {
  this.viewer.saveXML({format: true}, function (err, xml) {
    return xml;
  });
}

function readBpmn(filename){

}
