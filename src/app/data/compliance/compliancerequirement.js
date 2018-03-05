class cr {
  constructor(id) {
    this.id = id;
  }

  setTitle(title){
    this.title=title;
  }

  setRequirement(requirement){
    this.requirement=requirement;
  }

  setSource(source){
    this.source=source;
  }

  geTitle(){
    return this.title;
  }

  getRequirement(){
    return this.requirement;
  }

  getSource(){
    return this.source;
  }

  getId(){
    return this.id;
  }

}

module.exports = {
  cr
};
