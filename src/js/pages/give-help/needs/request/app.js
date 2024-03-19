import '../../../../common'
import { formatNeeds } from '../../../../models/give-help/requests/needs'

const apiRoutes = require('../../../../api')
const browser = require('../../../../browser')
const getApiData = require('../../../../get-api-data')
const getUrlParams = require('../../../../get-url-parameter')
const templating = require('../../../../template-render')

const ContactFormModel = require('../../../../models/GiveItemModel')

const ko = require('knockout')

const buildUrl = () => {
  const cardId = getUrlParams.parameter('id').replace('/', '')
  return `${apiRoutes.needs}${cardId}`
}

const initClickEvents = (data) => {
  const clickEvents = [
    {
      selector: 'js-card-back',
      action: () => {
        browser.redirect('../')
      }
    },
    {
      selector: 'js-i-can-help-button',
      action: () => {
        if (data.type === 'money') {
          browser.redirect(data.donationUrl)
        } else {
          browser.scrollTo('.requests-detail__heading--i-can-help')
        }
      }
    }
  ]
  clickEvents
    .forEach((e) => {
      const elem = document.querySelector(`.${e.selector}`)
      if (elem) elem.addEventListener('click', e.action)
    })
}

const notFound = (result) => {
  templating.renderTemplate('js-card-not-found-tpl', {}, 'js-card-detail-output', () => {
    initClickEvents()
    browser.loaded()
  })
}

const outcomes = [
  {
    predicate: (resStatus) => resStatus.isOk(),
    action: (result) => {
      result.data.showLocation = result.data.postcode.length > 0 && result.data.type !== 'money'
      result.data.showContactForm = result.data.type !== 'money'
      const data = formatNeeds([result.data])[0]
      templating.renderTemplate('js-card-detail-tpl', { card: data }, 'js-card-detail-output', () => {
        initClickEvents(data)
        const contactFormModel = new ContactFormModel()
        contactFormModel.needId = data.id
        ko.applyBindings(contactFormModel, document.querySelector('.requests-detail__form'))

        browser.loaded()
      })
    }
  },
  {
    predicate: (resStatus) => resStatus.isNotFound(),
    action: notFound
  },
  {
    predicate: (resStatus) => true,
    action: (result) => browser.redirect('/500')
  }
]

const init = function () {
  browser.loading()
  getApiData.data(buildUrl())
    .then((result) => {
      const resStatus = getApiData.status(result)
      outcomes
        .filter((o) => o.predicate(resStatus))[0]
        .action(result)
    }, (e) => {
      notFound()
    })
}

init()
