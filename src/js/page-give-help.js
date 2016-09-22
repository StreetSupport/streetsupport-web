let LocationSelector = require('./locationSelector')
let locationSelector = new LocationSelector()
let templating = require('./template-render')

locationSelector
  .getCurrent()
  .then((result) => {
    let theData = {
      isManchester: result.id === 'manchester'
    }
    let callback = () => {

    }
    templating.renderTemplate('js-charter-tpl', theData, 'js-charter-output', callback)
  }, (_) => {

  })
