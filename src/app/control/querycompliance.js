module.exports = {
  getRequirementById,
  getRequirementBySource,
  getRequirementContainsText,
  getRequirementContainsTitle,
  toString
};

function getRequirementContainsTitle(requirements, input) {
  let result = [];
  for (let i in requirements) {
    if (requirements[i].title != undefined) {
      let low_title = requirements[i].title.toLowerCase();
      let low_input = input.toLowerCase();
      if (low_title.includes(low_input)) {
        result.push(requirements[i]);
      }
    }
  }
  return result;
}

function getRequirementContainsText(requirements, input) {
  let result = [];
  for (let i in requirements) {
    let low_req = requirements[i].text.toLowerCase();
    let low_input = input.toLowerCase();
    if (low_req.includes(low_input)) {
      result.push(requirements[i]);
    }
  }
  return result;
}

function getRequirementBySource(requirements, paragraph, section) {
  let result = [];

  if (section == undefined) {
    for (let i in requirements) {
      if (requirements[i].source.paragraph == paragraph) {
        result.push(requirements[i]);
      }
    }
  } else if (paragraph == undefined) {
    for (let i in requirements) {
      if (requirements[i].source.section != undefined && requirements[i].source.section == section) {
        result.push(requirements[i]);
      }
    }
  } else {
    for (let i in requirements) {
      if (requirements[i].source.paragraph == paragraph && requirements[i].source.section != undefined && requirements[i].source.section == section) {
        result.push(requirements[i]);
      }
    }
  }
  return result;
}

function getRequirementById(requirements, id) {
  for (let i in requirements) {
    if (requirements[i].id == id) {
      return requirements[i];
    }
  }
}

function toString(requirements, id) {
  let requirement = getRequirementById(requirements, id);
  return "ID: " + requirement.id + "\n" + "Source: " + requirement.source.norm + ", " + requirement.source.paragraph + ", Section " + requirement.source.section + "\nTitle: " + requirement.title + "\n" + requirement.text;
}
