let convert = require('xml-js');

module.exports = {
  getJSON,
  addCompliance
};


/*
let compliance = {
  requirement: [],
};
*/


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

function getJSON(input) {
  if (input.includes('requirement')) {
    let json = JSON.parse(input);
    return getComplianceFromJson(json);
  } else {
    let helpObj = JSON.parse(convert.xml2json(input, {compact: true, spaces: 2}));

    return getComplianceFromXml(helpObj);
  }

}

function getComplianceFromJson(json) {
  let compliance = {
    requirement: [],
  };

  let result = Object.assign({}, compliance);


  for (let i in json.requirement) {
    let req_json = json.requirement[i];
    let cs_json = json.requirement[i].source;
    let req = new requirement();
    let cs = new source();

    cs.id = 'source_' + cs.norm + '_' + cs.paragraph + '_' + cs.section;
    cs.norm = cs_json.norm;
    cs.paragraph = cs_json.paragraph;
    cs.section = cs_json.section;

    req.id = 'requirement_' + cs.norm + '_' + cs.paragraph + '_' + cs.section;
    req.text = req_json.text;
    req.title = req_json.title;
    req.source = cs;

    result.requirement.push(req);
  }

  return result;

}

function getComplianceFromXml(helpObj) {
  let compliance = {
    requirement: [],
  };

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
                  let norm = helpObj.dokumente.norm[i].metadaten.jurabk;

                  if (norm.length == undefined) {
                    cs.norm = norm._text;
                  } else {
                    cs.norm = norm[0]._text;
                  }

                  cs.paragraph = '§ ' + getPlainParagraph(helpObj.dokumente.norm[i].metadaten.enbez._text);
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
                cs.paragraph = '§ ' + getPlainParagraph(helpObj.dokumente.norm[i].metadaten.enbez._text);
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

function addCompliance(input) {
  // compliance: existing compliance json
  // imported_compliance: compliance to be added to compliance

  let compliance = input.compliance;
  let imported_compliance = input.imported_compliance;

  if (compliance === null) {
    return imported_compliance;
  } else {
    let updated_compliance = compliance;

    for (let i = 0; i < imported_compliance.requirement.length; i++) {
      let req_import = imported_compliance.requirement[i];
      let isNew = true;

      for (let j = 0; j < compliance.requirement.length; j++) {
        let req = compliance.requirement[j];

        if (req_import.id === req.id) {
          isNew = false;
        }
      }

      if (isNew) {
        updated_compliance.requirement.push(req_import);
      }
    }

    return updated_compliance;
  }
}
