module.exports = {

}

//geht nicht
function colorElement(element) {

  var overlays = this.viewer.get('overlays');
  //var elementRegistry = viewer.get('elementRegistry');

  //var shape = elementRegistry.get('UserTask_1');

  var $overlayHtml =
    $('<div class="highlight-overlay">')
      .css({
        width: element.width,
        height: element.height
      });

  overlays.add(element.id, {
    position: {
      top: -5,
      left: -5
    },
    html: $overlayHtml
  });

}
