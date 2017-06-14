const browser = require('../../../browser')
const templating = require('../../../template-render')
const socialShare = require('../../../social-share')
const ContactFormModel = require('../../GiveItemModel')

import htmlEncode from 'htmlencode'
const ko = require('knockout')
import Holder from 'holderjs'

const searchSelector = '#js-card-search'
const cardDetailSelector = '.js-card-detail'
const activeClass = 'is-active'
const hiddenClass = 'is-hidden'

export const updateMeta = (title, description) => {
  const newTitle = htmlEncode.htmlDecode(title)
  const newDescription = htmlEncode.htmlDecode(description)

  document.querySelector('meta[property="og:title"]').setAttribute('content', newTitle)
  document.querySelector('meta[property="og:description"]').setAttribute('content', newDescription)
  document.title = newTitle
  document.description = newDescription
}

export const displayCard = (el, cardData, callback) => {
  let cardCallback = () => {
    document.querySelector(cardDetailSelector).classList.remove(hiddenClass)
    document.querySelector(cardDetailSelector).classList.add(activeClass)

    let theId = el.getAttribute('data-id')
    let iCanHelpButton = document.querySelector('.js-i-can-help-button')
    iCanHelpButton.addEventListener('click', function (event) {
      event.preventDefault()
      if (cardData.type === 'money') {
        window.location = cardData.donationUrl
      } else {
        browser.scrollTo('.requests-detail__heading--i-can-help')
      }
    })

    let contactFormModel = new ContactFormModel()
    contactFormModel.needId = theId
    ko.applyBindings(contactFormModel, document.querySelector('.requests-detail__form'))

    initFbShare()

    Holder.run({})

    // TODO: Proper URL support
    let state = { test: 'TBA' }
    browser.pushHistory(state, 'TEST', '?id=' + theId)

    Array.from(document.querySelectorAll('.js-card-back'))
      .forEach((link) => {
        link.addEventListener('click', (event) => {
          event.preventDefault()
          callback()
        })
      })

    socialShare.updateSharePageHrefs()

    browser.scrollTo('.sticky')
  }

  let initFbShare = () => {
    let el = document.querySelector('.js-fb-share-page')
    el.addEventListener('click', function (e) {
      e.preventDefault()
      var facebookAppID = '244120752609710'
      let url = 'https://www.facebook.com/dialog/feed?app_id=' + facebookAppID +
      '&link=' + encodeURIComponent(window.location.href) +
      '&name=' + encodeURIComponent(document.title) +
      '&description=' + encodeURIComponent(document.description) +
      '&redirect_uri=https://www.facebook.com'
      window.open(url)
    })
  }

  let initCardDetail = () => {
    cardData.showLocation = cardData.postcode.length > 0 && cardData.type !== 'money'
    cardData.showContactForm = cardData.type !== 'money'

    updateMeta(cardData.description + ' needed for ' + cardData.serviceProviderName, cardData.reason)

    // hide search
    document.querySelector(searchSelector).classList.remove(activeClass)
    document.querySelector(searchSelector).classList.add(hiddenClass)

    // Append object name for Hogan
    let theCardTemplateData = { card: cardData }

    templating.renderTemplate('js-card-detail-tpl', theCardTemplateData, 'js-card-detail-output', cardCallback)
  }

  initCardDetail()
}

export const displayCardNotFound = () => {
  document.querySelector(searchSelector).classList.remove(activeClass)
  document.querySelector(searchSelector).classList.add(hiddenClass)

  templating.renderTemplate('js-card-not-found-tpl', {}, 'js-card-detail-output', () => {
    document.querySelector(cardDetailSelector).classList.remove(hiddenClass)
    document.querySelector(cardDetailSelector).classList.add(activeClass)

    browser.scrollTo('.sticky')

    document.querySelector('.js-card-back')
      .addEventListener('click', (event) => {
        event.preventDefault()
        browser.pushHistory({}, 'from openIfCardRequested', '')
        displayListing()
      })
  })
}

export const displayListing = () => {
  document.querySelector(searchSelector).classList.remove(hiddenClass)
  document.querySelector(searchSelector).classList.add(activeClass)

  document.querySelector(cardDetailSelector).classList.remove(activeClass)
  document.querySelector(cardDetailSelector).classList.add(hiddenClass)

  updateMeta('Requests for Help - Street Support', 'Organisations need specific items, skills and money to support homeless people in Manchester - can you help?')
}
