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
    : `<dl class="map-info-window__opening-times">${getOpeningTimesMarkup()}</dl>`
  const suitableForMarkup = p.tags.length > 0
  ? `<p>Suitable for: <span class="h3">${p.tags.join(', ')}</span></p>`
  : ''
  const telephoneMarkup = p.telephone !== null && p.telephone.length > 0
    ? `<p>Telephone: <span class="h3">${p.telephone}</span></p>`
    : ''

  const output = `<div class="map-info-window">
      <h1 class="h2"><a href="/find-help/organisation/?organisation=${p.serviceProviderId}">${htmlEncode.htmlDecode(p.serviceProviderName)}</a></h1>
      ${suitableForMarkup}
      ${telephoneMarkup}
      <p>${htmlEncode.htmlDecode(p.info)}</p>
      ${timesMarkup}
      <a href="/find-help/organisation/?organisation=${p.serviceProviderId}" class="btn btn--brand-e">
        <span class="btn__text">More about ${htmlEncode.htmlDecode(p.serviceProviderName)}</span>
      </a>
    </div>`

  return output
}
