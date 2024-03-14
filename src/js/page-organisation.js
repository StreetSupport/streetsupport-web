import './common'

const urlParameter = require('./get-url-parameter')
const accordion = require('./accordion')
const htmlEncode = require('htmlencode')
const marked = require('marked')
marked.setOptions({ sanitize: true })
const apiRoutes = require('./api')
const getApiData = require('./get-api-data')
const analytics = require('./analytics')
const templating = require('./template-render')
const browser = require('./browser')

const theOrganisation = urlParameter.parameter('organisation')
const organisationUrl = `${apiRoutes.organisation}${theOrganisation}`
const accommodationUrl = `${apiRoutes.accommodation}?providerId=${theOrganisation}`

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
      let tagName
      if (tag === 'charity') {
        tagName = 'Registered Charity'
      } else {
        tagName = tag.replace(/-/g, ' ')
      }

      data.formattedTags.push({ id: tag, name: tagName })
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
        if (service.locationDescription !== null) {
          service.locationDescription = marked(htmlEncode.htmlDecode(service.locationDescription))
        }
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
      const groupedOpeningTimes = []
      a.openingTimes.forEach((ot) => {
        const match = groupedOpeningTimes.filter((got) => got.day === ot.day)
        if (match.length === 1) {
          match[0].openingTimes.push({
            endTime: ot.endTime,
            startTime: ot.startTime
          })
        } else {
          const newDay = {
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
      a.hasOpeningTimes = a.openingDays.length > 0

      setOrgOtherServicesAsServicesNotAssignedToAddress(a)
    })
  }

  formatMarkdownFields()
  formatTags()
  formatServices()
  formatAddresses()

  return data
}

getApiData.data(organisationUrl)
  .then(function (result) {
    var data = result.data

    var theTitle = htmlEncode.htmlDecode(data.name + ' - Street Support')
    document.title = theTitle

    // Append object name for Hogan
    var theData = { organisation: formatData(result.data) }

    var callback = function () {
      browser.loaded()
      accordion.init()
      analytics.init(theTitle)
    }

    templating.renderTemplate('js-breadcrumb-tpl', theData, 'js-breadcrumb-output')
    templating.renderTemplate('js-header-tpl', theData, 'js-header-output')
    templating.renderTemplate('js-organisation-tpl', theData, 'js-organisation-output')
    templating.renderTemplate('js-contact-tpl', theData, 'js-contact-output', callback)
  })

getApiData.data(accommodationUrl)
  .then((result) => {
    if (result.data.total > 0) {
      var accEntries = result.data.items
      for (var i = 0; i <= accEntries.length - 1; i++) {
        accEntries[i].name = htmlEncode.htmlDecode(accEntries[i].name)
      }
      const theData = {
        items: accEntries
      }
      templating.renderTemplate('js-accommodation-tpl', theData, 'js-accommodation-output')
    }
  })
