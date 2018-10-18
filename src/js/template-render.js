const Hogan = require('hogan.js')

const renderTemplate = function (templateId, data, output, callback = () => {}) {
  const theTemplate = document.getElementById(templateId).innerHTML
  const compileTemplate = Hogan.compile(theTemplate)
  document.getElementById(output).innerHTML = compileTemplate.render(data)
  callback(data)
}

module.exports = {
  renderTemplate: renderTemplate
}
