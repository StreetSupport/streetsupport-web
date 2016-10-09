import './common'
let location = require('./location/locationSelector')
const templating = require('./template-render')
const browser = require('./browser')
const socialShare = require('./social-share')

location
  .getCurrent()
  .then((result) => {
    let cityLabel = result.id === 'manchester'
      ? 'Manchester'
      : 'Leeds'
    let theData = {
      isManchester: result.id === 'manchester',
      isLeeds: result.id === 'leeds',
      locations: location.getViewModel(result)
    }
    var callback = function () {
      location.handler(() => {
        window.location.reload()
      }, '.js-homepage-promo-location-selector')

      document.querySelector('.js-city-label')
        .innerHTML = 'in ' + cityLabel

      browser.loaded()
      socialShare.init()
    }

    templating.renderTemplate('js-content-tpl', theData, 'js-template-output', callback)
  })
