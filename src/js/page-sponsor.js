// Common modules
import './common'
var ko = require('knockout')
var Model = require('./models/SponsorModel')
var location = require('./location/locationSelector')
const templating = require('./template-render')
const supportedCities = require('./location/supportedCities')

location
  .getCurrent()
  .then((result) => {
    let theData = {}
    supportedCities.locations
      .forEach((c) => {
        theData[`is${c.id}`] = result.id === c.id
      })
    let callback = () => {
      ko.applyBindings(new Model())
    }

    templating.renderTemplate('js-content-tpl', theData, 'js-template-output', callback)
  })
