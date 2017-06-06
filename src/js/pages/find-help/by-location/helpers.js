const apiRoutes = require('../../../api')
const browser = require('../../../browser')
const querystring = require('../../../get-url-parameter')
const htmlEncode = require('htmlencode')

export const buildFindHelpUrl = (locationResult) => {
  const re = new RegExp(/find-help\/(.*)\//)
  const category = browser.location().pathname.match(re)[1].split('/')[0]
  const location = querystring.parameter('location')
  const range = querystring.parameter('range')

  let url = apiRoutes.cities + locationResult.findHelpId + '/services/' + category
  if (location === 'my-location') {
    url = apiRoutes.servicesByCategory + category + '/' + locationResult.latitude + '/' + locationResult.longitude
  }
  url += '?range=' + range

  return url
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
  ? `<p>Suitable for: ${p.tags.join(', ')}</p>`
  : ''
  const telephoneMarkup = p.telephone.length > 0
    ? `<p>Telephone: ${p.telephone}`
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
