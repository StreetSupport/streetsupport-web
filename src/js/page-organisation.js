import './common'

var urlParameter = require('./get-url-parameter')
var accordion = require('./accordion')
var htmlEncode = require('htmlencode')
var marked = require('marked')
marked.setOptions({sanitize: true})
var socialShare = require('./social-share')
var apiRoutes = require('./api')
var getApiData = require('./get-api-data')
var analytics = require('./analytics')
var templating = require('./template-render')
var browser = require('./browser')

var theOrganisation = urlParameter.parameter('organisation')
var organisationUrl = apiRoutes.organisation += theOrganisation

browser.loading()

const isOpen247 = function (openingTimes) {
  return openingTimes.length === 7 && openingTimes.filter((ot) => ot.startTime === '00:00' && ot.endTime === '23:59').length === 7
}

const formatData = function (data) {
  const formatMarkdownFields = () => {
    const markdownFields = ['description', 'itemsDonationDescription', 'donationDescription']

    markdownFields
      .forEach((f) => {
        data[f] = marked(htmlEncode.htmlDecode(data[f]))
      })
  }

  const formatTags = () => {
    data.formattedTags = []
    data.tags.forEach((tag) => {
      data.formattedTags.push({ id: tag, name: tag.replace(/-/g, ' ') })
    })
  }

  const formatServices = () => {
    data.providedServices = data.providedServices
      .sort((a, b) => {
        if (a.name < b.name) return -1
        if (a.name > b.name) return 1
        return 0
      })

    data.providedServices
      .forEach(function (service) {
        if (service.tags !== null) {
          service.tags = service.tags.join(', ')
        }
        if (service.info !== null) {
          service.info = marked(htmlEncode.htmlDecode(service.info))
        }
        service.isOpen247 = isOpen247(service.openingTimes)
      })
  }

  const setOrgOtherServicesAsServicesNotAssignedToAddress = (a) => {
    data.providedServices = data.providedServices
      .filter((s) => {
        return s.address.postcode.replace(/\s/gi, '') !== a.postcode.replace(/\s/gi, '')
      })

    data.hasOtherServices = data.providedServices.length > 0
  }

  const formatAddresses = () => {
    data.hasAddresses = data.addresses.length > 0
    data.addresses.forEach((a) => {
      let groupedOpeningTimes = []
      a.openingTimes.forEach((ot) => {
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
      a.services = data.providedServices
        .filter((s) => s.address.postcode.replace(/\s/gi, '') === a.postcode.replace(/\s/gi, ''))
      a.hasServices = a.services.length > 0

      setOrgOtherServicesAsServicesNotAssignedToAddress(a)
    })
  }

  formatMarkdownFields()
  formatTags()
  formatServices()
  formatAddresses()

  return data
}

getApiData.data(organisationUrl).then(function (result) {
  var data = result.data

  var theTitle = htmlEncode.htmlDecode(data.name + ' - Street Support')
  document.title = theTitle

  // Append object name for Hogan
  var theData = { organisation: formatData(result.data) }

  var callback = function () {
    browser.loaded()
    accordion.init()
    analytics.init(theTitle)
    socialShare.init()
  }

  templating.renderTemplate('js-organisation-tpl', theData, 'js-organisation-output', callback)
})
