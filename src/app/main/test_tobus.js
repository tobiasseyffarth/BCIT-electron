/***
 * let und const
 * statt var
 */

var ichbineineVariable = 9;
let ichbinlocal = 8;
{
  ichbinlocal = 9;
}
let i = 8;
const j = 2;
//j =7; geht nicht

/***
 * Typsicherheit? Nein
 */

let k = true;
if(k === "true"){
  console.log(true);
}

let l = 9.5;
Number.isInteger(l);
console.log(typeof l);

/***
 * JSON Javascript object notation
 */

let xml   = "<head>wert</head>";
let json  = { head: 9, weiteres: "sdfuh" };
console.log(json.head);

let jsonMitFunction = {
  head: "irgendwas",
  obj: {
    einString: ""
  },
  arr: [],
  fktn: function(param){ console.log("Ich bin eine Fukntion"); },
  complex: new Array(),
  fktn2: (param) => { return true; }
};
if(true){

}

jsonMitFunction.name = "MeinName";
jsonMitFunction.fktn();

function mitName(){}
let n = null;
let m;

//https://toddmotto.com/understanding-javascript-types-and-reliable-type-checking/

/***
 * Callbacks
 */
function plus1(param1, cb){
  let addition = param1 + 1;
  cb(addition);
}

//Input Param 1 = "Wert"
//Input Param 2 = Function()
plus1(9, function(add){
  console.log(add); //ergibt "Wert"
});
//sdjgbdfuoindfnildf
//dfnjdfgfjflfgb

/***
 * Klassen
 */

class EineKLasse{
  constructor(name){
    this.name = name;
    this.createdAt = new Date();
    this.init();
  }

  init(){
    this.x = null;
  }

  getName(){ return this.name; }
  setName(name) { this.name = name; }
}

let bbb = new EineKLasse("MeinName");
console.log(bbb.name);
bbb.x = 2;

/***
 * Module
 */

import bpmnjs from "bpmn-js";
import fileOpen from "./../../helpers/fileopen_dialogs";
import { bpmnFileOpenDialog } from "./../../helpers/fileopen_dialogs";

fileOpen.bpmnFileOpenDialog();
bpmnFileOpenDialog();

let bpmnjs2 = require("bpmn-js");

module.exports = {
  klasse: bbb,
  plus1
};

import cs from "../data/compliance/compliancesource";
let y=new cs;
