var Hogan = require('hogan.js')

var renderTemplate = function (templateId, data, output, callback) {
  var theTemplate = document.getElementById(templateId).innerHTML
  var compileTemplate = Hogan.compile(theTemplate)
  document.getElementById(output).innerHTML = compileTemplate.render(data)
  callback()
}

module.exports = {
  renderTemplate: renderTemplate
}
