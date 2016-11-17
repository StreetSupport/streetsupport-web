import './common'

var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var htmlEncode = require('htmlencode')
var marked = require('marked')
marked.setOptions({sanitize: true})
var socialShare = require('./social-share')
var sortBy = require('lodash/collection/sortBy')
var forEach = require('lodash/collection/forEach')
var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var analytics = require('./analytics')
var templating = require('./template-render')
var browser = require('./browser')

var theOrganisation = urlParameter.parameter('organisation')
var organisationUrl = apiRoutes.organisation += theOrganisation

browser.loading()

getApiData.data(organisationUrl).then(function (result) {
  var data = result.data
  var theTitle = htmlEncode.htmlDecode(data.name + ' - Street Support')
  document.title = theTitle

  data.providedServices = sortBy(data.providedServices, function (item) {
    return item.name
  })

  data.formattedTags = []
  forEach(data.tags, function (tag) {
    data.formattedTags.push({ id: tag, name: tag.replace(/-/g, ' ') })
  })

  forEach(data.addresses, (a) => {
    let groupedOpeningTimes = []
    forEach(a.openingTimes, (ot) => {
      let match = groupedOpeningTimes.filter((got) => got.day === ot.day)
      if (match.length === 1) {
        match[0].openingTimes.push({
          endTime: ot.endTime,
          startTime: ot.startTime
        })
      } else {
        let newDay = {
          day: ot.day,
          openingTimes: [{
            endTime: ot.endTime,
            startTime: ot.startTime
          }]
        }
        groupedOpeningTimes.push(newDay)
      }
    })
    a.openingDays = groupedOpeningTimes
  })

  forEach(data.providedServices, function (service) {
    if (service.tags !== null) {
      service.tags = service.tags.join(', ')
    }
    if (service.info !== null) {
      service.info = marked(service.info)
    }
  })

  // Append object name for Hogan
  var theData = { organisation: data }

  var callback = function () {
    browser.loaded()
    accordion.init()
    analytics.init(theTitle)
    socialShare.init()
  }

  templating.renderTemplate('js-organisation-tpl', theData, 'js-organisation-output', callback)
})
