import './common'

const locationSelector = require('./location/locationSelector')
const getApiData = require('./get-api-data')
const apiRoutes = require('./api')
const browser = require('./browser')

const location = locationSelector.getCurrentHub()
const locationId = location.id

const showInactiveNotice = function (locationName) {
  const container = document.getElementById('js-swep-availability-status')
  if (!container) return

  container.innerHTML = `
    <div class="block block--swep-inactive-notice">
      <div class="container">
        <div class="block__content block__content--swep-notice">
          <h2 class="h2">Severe Weather Emergency Accommodation is not currently active in ${locationName}</h2>
          <p>This page provides information about emergency accommodation during severe weather. The service is activated when temperatures drop below freezing.</p>
          <p>If you need help right now, please visit:</p>
          <div class="swep-notice-ctas">
            <a href="/${locationId}/advice/" class="btn btn--brand-g">
              <span class="btn__text">See emergency advice</span>
            </a>
            <a href="/find-help/" class="btn btn--brand-e">
              <span class="btn__text">Find Help</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `
}

const hidePageContent = function () {
  const mainContent = document.querySelectorAll('.js-swep-content')
  mainContent.forEach((element) => {
    element.style.opacity = '0.6'
  })
}

getApiData
  .data(apiRoutes.cities)
  .then((result) => {
    const city = result.data.find((c) => c.id === locationId)

    if (city && !city.swepIsAvailable) {
      const locationName = city.name || locationId
      showInactiveNotice(locationName)
      hidePageContent()
    }

    browser.loaded()
  }, (_) => {
    browser.loaded()
  })
