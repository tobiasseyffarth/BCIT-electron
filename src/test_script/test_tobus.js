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
let ichbineinArray = [];
ichbineinArray.push(1);
ichbineinArray.push(3);
ichbineinArray.length;
console.log('Array', ichbineinArray[0]);
//j =7; geht nicht

/***
 * Typsicherheit? Nein
 */

let k = true;
console.log(k);

if (k == 'true') {
  console.log('stimmt', true);
}

let l = 9.5;
console.log(l);
console.log(typeof l);
console.log(Number.isInteger(l));
console.log(typeof l);
console.log(l);

/***
 * JSON Javascript object notation
 */

let xml = "<head>wert</head>";
let json = {head: 10, weiteres: "sdfuh"};
console.log(json.head);

let jsonMitFunction = {
  head: "irgendwas",
  obj: {
    einString: ""
  },
  arr: [],
  fktn: function (param) {
    console.log("Ich bin eine Fukntion");
  },
  complex: new Array(),
  fktn2: (param) => {
    return true;
  }
};

jsonMitFunction.head;
jsonMitFunction.test=12;

let json2={
  name: "Max",
  nachnamen: "Muster",
  alter: 42,
  test: function(){
    console.log('ausgabe der fun');
  },
  alter2: function() {this.alter*2;}
}

json2.alter=42;

console.log(json2.nachnamen);
console.log(json2.alter);

console.log(json2.alter2());

if (true) {

}

jsonMitFunction.name = "MeinName";
jsonMitFunction.fktn();

function mitName() {
}

let n = null;
let m;

//https://toddmotto.com/understanding-javascript-types-and-reliable-type-checking/

/***
 * Callbacks
 */
function plus1(param1, cb) {
  let addition = param1 + 1;
  cb(addition);
}


//Input Param 1 = "Wert"
//Input Param 2 = Function()
plus1(9, function (add) {
  console.log(add); //ergibt "Wert"
});


function test(input1, input2) {
  return input1 + input2;
}

console.log(test(1, 2));

/***
 * Klassen
 */

class EineKLasse {


  constructor(name) {
    this.name = name;
    this.createdAt = new Date();
    this.init();
    this.z = 2;
  }

  init() {
    this.x = null;
    this.y = null;
  }

  getName() {
    return this.name;
  }

  setName(name) {
    this.name = name;
  }
}

let bbb = new EineKLasse("MeinName");
console.log(bbb.name);
console.log(bbb.z);
bbb.x = 2;

let query =require("../app/control/queryprocess");
//query.getFlowElementById();

/***
 * Module



//import bpmnjs from "bpmn-js";
//import fileOpen from "./../../helpers/fileopen_dialogs";
//import { bpmnFileOpenDialog } from "./../../helpers/fileopen_dialogs";

//fileOpen.bpmnFileOpenDialog();
//bpmnFileOpenDialog();

let bpmnjs2 = require("bpmn-js");

module.exports = {
  klasse: bbb,
  plus1
};
/*
import cs from "../data/compliance/compliancesource";
let y=new cs;
*/

