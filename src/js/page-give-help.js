let LocationSelector = require('./locationSelector')
let locationSelector = new LocationSelector()
let templating = require('./template-render')

locationSelector
  .getCurrent()
  .then((result) => {
    console.log(result)
    let theData = {
      isManchester: result.id === 'manchester'
    }
    let callback = () => {

    }
    console.log(theData)
    templating.renderTemplate('js-charter-tpl', theData, 'js-charter-output', callback)
  }, (_) => {

  })
