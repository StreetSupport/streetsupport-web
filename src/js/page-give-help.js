import './common'

let locationSelector = require('./location/locationSelector')
let supportedCities = require('./location/supportedCities')
let templating = require('./template-render')
import { suffixer } from './location/suffixer'

locationSelector
  .getCurrent()
  .then((result) => {
    let theData = {}
    supportedCities.locations
      .forEach((c) => {
        theData[`is${c.id}`] = result.id === c.id
      })

    let callback = () => {
      suffixer(result)
    }
    templating.renderTemplate('js-charter-tpl', theData, 'js-charter-output', callback)
  }, (_) => {

  })
