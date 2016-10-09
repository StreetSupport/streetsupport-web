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
      document.querySelector('.js-city-label')
        .innerHTML = 'in ' + result.name
    }
    templating.renderTemplate('js-charter-tpl', theData, 'js-charter-output', callback)
  }, (_) => {

  })
