import './common'

const Location = require('./locationSelector')
const location = new Location()
const templating = require('./template-render')
const browser = require('./browser')
const socialShare = require('./social-share')

location
  .getCurrent()
  .then((result) => {
    let theData = {
      isManchester: result.id === 'manchester',
      isLeeds: result.id === 'leeds'
    }

    var callback = function () {
      browser.loaded()
      socialShare.init()
    }

    templating.renderTemplate('js-content-tpl', theData, 'js-template-output', callback)
  })
