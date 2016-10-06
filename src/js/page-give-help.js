import './common'

let locationSelector = require('./location/locationSelector')
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
