let json2 = {
  name: "Max",
  nachnamen: "Muster",
  alter: 42,

  obj: {
    einString: "a",
    zweiString: 'b'
  },

  test: function () {
    console.log('ausgabe der fun');
  },
  alter2: function () {
    return this.alter * 2;
  }
}

json2.alter = 42;

console.log(json2.nachnamen);
console.log(json2.alter);

console.log(json2.alter2());


json2.test();

json2.obj.einString;


let text = JSON.stringify(json2);
console.log(text);

let json3 = JSON.parse(text);
console.log(json3.name);


let person = {
  name: 'Ford',
  nachnamen: 'Benzin',
  alter: undefined,
  wohnort: {
    plz: 'green',
    ort: 'alu',
    street: 'Leipziger Strasse'
  }
}

class pers {
  constructor(name, vorname, alter) {
    this.name = name;
    this.vorname = vorname;
    this.alter = alter;
  }

  age_increment() {
    this.alter++;
  }
}

console.log(person.wohnort);
let max = new pers('max', 'muster', 14);
//max.name='max';
console.log(max.name);
//console.log(max.vorname);
console.log(max.alter);
max.age_increment();
console.log(max.alter);

console.log(JSON.stringify(person));


let ar = [];
ar.push(person);
person.name = 'hans';
ar.push(person);
person.name = 'sebastian';
ar.push(person);

console.log(ar.length);

for (let i = 0; i < ar.length; i++) {
  console.log(JSON.stringify(ar[i]));
}

for (i in ar) {
  console.log(ar[i].name);
}

let classar = [];
classar.push(new pers('max'));
classar.push(new pers('hans'));
classar.push(new pers('thomas'));

for (let i = 0; i < classar.length; i++) {
  console.log(classar[i].name);
}


myObj = {"name": "John", "age": 30, "car": null};
for (x in myObj) {
  console.log(x);
}

for (x in myObj) {
  console.log(myObj[x]);
}

console.log(">>>>>>>>>>");

let personenliste = {
  listenname: "L1",
  ar: []
}

personenliste.ar.push(new pers('max', 'muster', 42));
personenliste.ar.push(new pers('hans', 'muster', 43));
personenliste.ar.push(new pers('thomas', 'muster', 12));

let text2 = JSON.stringify(personenliste);

let json4 = JSON.parse(text2);
console.log(json4);
console.log(json4.ar[0].name);
