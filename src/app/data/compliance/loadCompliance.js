let convert = require('xml-js');

module.exports = {
  getJSON
}

let compliance = {
  requirement: [],

  getRequirementContainsTitle: function (title) {
    let result = [];
    for (let i in this.requirement) {
      if (this.requirement[i].title != undefined && this.requirement[i].title.includes(title)) { //lowercase einbauen
        result.push(this.requirement[i]);
      }
    }
    return result;
  },
  getRequirementContainsText: function (text) {
    let result = [];
    for (let i in this.requirement) {
      if (this.requirement[i].text.includes(text)) { //lowercase einbauen
        result.push(this.requirement[i]);
      }
    }
    return result;
  },
  getRequirementBySource(paragraph, section) {
    let result = [];

    if (section == undefined) {
      for (let i in this.requirement) {
        if (this.requirement[i].source.paragraph == paragraph) {
          result.push(this.requirement[i]);
        }
      }
    } else if (paragraph == undefined) {
      for (let i in this.requirement) {
        if (this.requirement[i].source.section != undefined && this.requirement[i].source.section == section) {
          result.push(this.requirement[i]);
        }
      }
    } else {
      for (let i in this.requirement) {
        if (this.requirement[i].source.paragraph == paragraph && this.requirement[i].source.section != undefined && this.requirement[i].source.section == section) {
          result.push(this.requirement[i]);
        }
      }
    }
    return result;
  }
};

class requirement {
  constructor() {
    this.id = undefined;
    this.text = undefined;
    this.title = undefined;
    this.source = undefined;
  }
}

class source {
  constructor() {
    this.id = undefined;
    this.norm = undefined;
    this.paragraph = undefined;
    this.section = undefined;
  }
}

function getJSON(xml) {
  let helpObj = JSON.parse(convert.xml2json(xml, {compact: true, spaces: 2}));
  return getCompliance(helpObj);
}

function getCompliance(helpObj) {
  let result = Object.assign({}, compliance);

  for (let i in helpObj.dokumente.norm) {
    if (helpObj.dokumente.norm[i].metadaten.enbez != undefined) {
      if (helpObj.dokumente.norm[i].textdaten.text != undefined) {
        if (helpObj.dokumente.norm[i].textdaten.text.Content != undefined) {
          if (helpObj.dokumente.norm[i].textdaten.text.Content.P != undefined) { //falls ein Paragraph gelöscht wurde
            if (helpObj.dokumente.norm[i].textdaten.text.Content.P.length != undefined) {
              for (let j in helpObj.dokumente.norm[i].textdaten.text.Content.P) {
                let s = helpObj.dokumente.norm[i].textdaten.text.Content.P[j]._text;
                if (s != undefined) {
                  let r = new requirement();
                  if (helpObj.dokumente.norm[i].metadaten.titel != undefined) {
                    r.title = helpObj.dokumente.norm[i].metadaten.titel._text;
                  }
                  r.text = getPlainText(s);
                  let cs = new source();
                  cs.norm = helpObj.dokumente.norm[i].metadaten.jurabk._text;
                  cs.paragraph = getPlainParagraph(helpObj.dokumente.norm[i].metadaten.enbez._text);
                  cs.section = Number(j) + 1;
                  cs.id = 'source_' + cs.norm + '_' + cs.paragraph + '_' + cs.section;
                  r.source = cs;
                  r.id = 'requirement_' + cs.norm + '_' + cs.paragraph + '_' + cs.section;
                  result.requirement.push(r);
                }
              }
            } else {
              let s = helpObj.dokumente.norm[i].textdaten.text.Content.P._text; //wenn keine Absätze vorhanden sind, Paragraphen ausgeben
              if (s != undefined) {
                let r = new requirement();
                if (helpObj.dokumente.norm[i].metadaten.titel != undefined) {
                  r.title = helpObj.dokumente.norm[i].metadaten.titel._text;
                }
                r.text = getPlainText(s);
                let cs = new source();
                cs.norm = helpObj.dokumente.norm[i].metadaten.jurabk._text;
                cs.paragraph = getPlainParagraph(helpObj.dokumente.norm[i].metadaten.enbez._text);
                r.source = cs;
                cs.id = 'source_' + cs.norm + '_' + cs.paragraph;
                r.id = 'requirement_' + cs.norm + '_' + cs.paragraph;
                result.requirement.push(r);
              }
            }
          }
        }
      }
    }
  }
  return result;
}

function getPlainText(input) {
  let j;
  let pattern = new RegExp('[A-Ü]');
  let s = input.toString()

  for (let i = 0; i < s.length; i++) {
    let character = s.charAt(i);
    if (pattern.test(character)) {
      j = i;
      break;
    }
  }
  return s.substring(j, s.length);
}

function getPlainParagraph(input) {
  return input.substring(2, input.length);
}
