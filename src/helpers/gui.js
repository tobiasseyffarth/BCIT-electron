module.exports = {
  clearList
}

function clearList(list) {
  for (let i in list) {
    list.remove(i);
  }
}

