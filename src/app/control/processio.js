import fs from "fs";

module.exports = {
  readFile, saveXml
};

function readFile(url) {
  return new Promise((res, rej) => {
      fs.readFile(url, 'utf-8', function (err, data) {
        if(err) rej(err);

        res(data);
      });
    });
}

//final
function saveXml(viewer) {
  let result;
  viewer.saveXML({format: true}, function (err, xml) {
    result=xml;
  });
  return result;
}
