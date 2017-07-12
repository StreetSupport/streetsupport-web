// Common modules
import '../../../common'
const browser = require('../../../browser')

const accordion = require('../../../accordion')

const situationSelectors = {
  accordion: '.js-situation-accordion',
  header: '.js-situation-header'
}

accordion.init(false, -1, { accordionOpened: () => {} }, false, situationSelectors)

const accomTypesSelectors = {
  accordion: '.js-accom-types-accordion',
  header: '.js-accom-types-header'
}

accordion.init(false, -1, { accordionOpened: () => {} }, false, accomTypesSelectors)

const openPanel = function (panelId) {
  const el = document.getElementById(panelId)
  const context = document.querySelectorAll('.js-accom-types-accordion')
  const useAnalytics = true

  accordion.reOpen(el, context, useAnalytics)
  browser.scrollTo(`#${panelId}`)
}

const accomTypeLinks = document.querySelectorAll('.accom-type-link')
accomTypeLinks
  .forEach((l) => {
    l.addEventListener('click', function () {
      const linkId = l.getAttribute('data-id')
      openPanel(linkId)
    })
  })
