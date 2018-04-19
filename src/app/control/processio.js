import fs from "fs";

module.exports = {
  readFile, writeBpmnToXML
};

function readFile(url) {
  return new Promise((res, rej) => {
      fs.readFile(url, 'utf-8', function (err, data) {
        if(err) rej(err);

        res(data);
      });
    });
}

//todo: wie kann der Prozess zu xml geschrieben werden?
function writeBpmnToXML(viewer) { //saveXML
  viewer.toXML({format: true}, function (err, xml) {
    return xml;
  });
}

function readBpmn(filename){

}
