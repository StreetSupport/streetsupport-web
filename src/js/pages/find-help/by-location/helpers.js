const apiRoutes = require('../../../api')
const querystring = require('../../../get-url-parameter')
const htmlEncode = require('htmlencode')

export const buildFindHelpUrl = (locationResult) => {
  const category = querystring.parameter('category')
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
  const timeMarkup = p.openingTimes
    .map((ot) => {
      const titleClass = ot.day !== previousDay
        ? ''
        : 'hide-screen'
      previousDay = ot.day
      return `<dt class="map-info-window__opening-times-day ${titleClass}">${ot.day}</dt>
        <dd class="map-info-window__opening-times-time">${ot.startTime} - ${ot.endTime}</dd>`
    })
    .join('')
  const suitableForMarkup = p.tags.length > 0
  ? `<p>Suitable for: ${p.tags.join(', ')}</p>`
  : ''

  const output = `<div class="map-info-window">
      <h1 class="h2"><a href="/find-help/organisation/?organisation=${p.serviceProviderId}">${htmlEncode.htmlDecode(p.serviceProviderName)}</a></h1>
      ${suitableForMarkup}
      <p>${htmlEncode.htmlDecode(p.info)}</p>
      <dl class="map-info-window__opening-times">${timeMarkup}</dl>
      <a href="/find-help/organisation/?organisation=${p.serviceProviderId}" class="btn btn--brand-e">
        <span class="btn__text">More about ${htmlEncode.htmlDecode(p.serviceProviderName)}</span>
      </a>
    </div>`

  return output
}
