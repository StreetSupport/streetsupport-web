import './common'

var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var htmlEncode = require('htmlencode')
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

  forEach(data.providedServices, function (provider) {
    if (provider.tags !== null) {
      provider.tags = provider.tags.join(', ')
    }
  })

  // Append object name for Hogan
  var theData = { organisation: data }

  console.log(theData)

  var callback = function () {
    accordion.init()
    browser.loaded()
    analytics.init(theTitle)
    socialShare.init()
  }

  templating.renderTemplate('js-organisation-tpl', theData, 'js-organisation-output', callback)
})
