const apiRoutes = require('../../../api')
const browser = require('../../../browser')
const querystring = require('../../../get-url-parameter')
const htmlEncode = require('htmlencode')

export const buildFindHelpUrl = (locationResult, range = querystring.parameter('range')) => {
  const re = new RegExp(/find-help\/(.*)\//)
  const category = browser.location().pathname.match(re)[1].split('/')[0]
  return apiRoutes.servicesByCategory + category + '/' + locationResult.latitude + '/' + locationResult.longitude + '?range=' + range
}

export const buildInfoWindowMarkup = (p) => {
  let previousDay = ''
  const getOpeningTimesMarkup = () => {
    return p.openingTimes
      .map((ot) => {
        const titleClass = ot.day !== previousDay
          ? ''
          : 'hide-screen'
        previousDay = ot.day
        return `<dt class="map-info-window__opening-times-day ${titleClass}">${ot.day}</dt>
          <dd class="map-info-window__opening-times-time">${ot.startTime} - ${ot.endTime}</dd>`
      })
      .join('')
  }
  const timesMarkup = p.isOpen247
    ? '<p>Open 24 hours a day, 7 days a week</p>'
    : `<dl>${getOpeningTimesMarkup()}</dl>`
  const suitableForMarkup = p.tags.length > 0
    ? `<p>Suitable for: ${p.tags.join(', ')}</p>`
    : ''
  const isTelephoneServiceMarkup = p.isTelephoneService
    ? '<p>This is a telephone service.</p>'
    : ''
  const isAppointmentOnlyMarkup = p.isAppointmentOnly
    ? '<p>Access to this service is by appointment only.</p>'
    : ''
  const telephoneMarkup = p.telephone !== null && p.telephone.length > 0
    ? `<p>Telephone: ${p.telephone}</p>`
    : ''

  return `<div class="card card--brand-h card--gmaps">
            <div class="card__title">
              <button class="card__close js-popup-close" title="close">&#10799;</button>
              <h1 class="h2"><a href="/find-help/organisation/?organisation=${p.serviceProviderId}">${htmlEncode.htmlDecode(p.serviceProviderName)}</a></h1>
              ${suitableForMarkup}
              ${isTelephoneServiceMarkup}
              ${isAppointmentOnlyMarkup}
            </div>
            <div class="card__details">
              ${telephoneMarkup}
              <p>${htmlEncode.htmlDecode(p.info)}</p>
              ${timesMarkup}
              <a href="/find-help/organisation/?organisation=${p.serviceProviderId}">More information</a>
            </div>
          </div>`
}
