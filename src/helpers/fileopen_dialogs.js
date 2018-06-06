import {remote} from "electron";
import fs from "fs";

/****
 * Main functions in frontend
 *
 */

const dialog = remote.dialog;

module.exports = {
  bpmnFileOpenDialog: () => {
    return new Promise((res, rej) => {
      dialog.showOpenDialog({
        filters: [
          {name: 'BPMN', extensions: ['bpmn']}
        ]
      }, function (fileNames) {

        if (fileNames === undefined) rej(null);

        let fileName = fileNames[0];

        fs.readFile(fileName, 'utf-8', function (err, data) {
          if (err) rej(err);

          res(data);
        });
      });
    });
  },
  complianceFileOpenDialog: () => {
    return new Promise((res, rej) => {
      dialog.showOpenDialog({
        filters: [
          {name: 'XML', extensions: ['xml']},
          {name: 'JSON', extensions: ['json']}
        ]
      }, function (fileNames) {

        if (fileNames === undefined) rej(null);

        let fileName = fileNames[0];

        fs.readFile(fileName, 'utf-8', function (err, data) {
          if (err) rej(err);

          res(data);
        });
      });
    });
  },
  infraFileOpenDialog: () => {
    return new Promise((res, rej) => {
      dialog.showOpenDialog({
        filters: [
          {name: 'XML', extensions: ['xml']}
        ]
      }, function (fileNames) {

        if (fileNames === undefined) rej(null);

        let fileName = fileNames[0];

        fs.readFile(fileName, 'utf-8', function (err, data) {
          if (err) rej(err);

          res(data);
        });
      });
    });
  },
  bcitFileOpenDialog: () => {
    return new Promise((res, rej) => {
      dialog.showOpenDialog({
        filters: [
          {name: 'BCIT', extensions: ['bcit']}
        ]
      }, function (fileNames) {

        if (fileNames === undefined) rej(null);

        let fileName = fileNames[0];

        fs.readFile(fileName, 'utf-8', function (err, data) {
          if (err) rej(err);

          res(fileName);
        });
      });
    });
  },
  bpmnFileSaveDialog: (xml) => {
    return new Promise((res, rej) => {
      dialog.showSaveDialog({
        filters: [
          {name: 'bpmn', extensions: ['bpmn']}
        ]
      }, function (fileName) {
        console.log(fileName);
        if (fileName == null) rej('kein pfad');
        fs.writeFile(fileName, xml, function (err) {
          if (err) rej(err);

          res(fileName);
        });
      });
    });
  },
  bcitFileSaveDialog: (file) => {
    return new Promise((res, rej) => {
      dialog.showSaveDialog({
        filters: [
          {name: 'BCIT', extensions: ['bcit']}
        ]
      }, function (fileName) {
        if (fileName == null) rej('kein pfad');
        fs.writeFile(fileName, file, function (err) {
          if (err) rej(err);

          res(fileName);
        });
      });
    });
  }
};
