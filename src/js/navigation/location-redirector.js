const browser = require('../browser')
const supportedCities = require('../location/supportedCities')

export const redirectTo = (locationId) => {
  const location = supportedCities.get(locationId)
  const redirects = {}
  const hasSelectedCity = () => location.id !== supportedCities.default().id
  const setGenericToCity = () => {
    redirects['/'] = `/${location.id}/`
    redirects['/find-help/emergency-help/'] = `/${location.id}/emergency-help/`
    redirects['/find-help/severe-weather-accommodation/'] = `/${location.id}/severe-weather-accommodation/`
  }
  const setCityToGeneric = () => {
    supportedCities.locations
      .filter((c) => c.isSelectableInBody)
      .forEach((c) => {
        redirects[`/${c.id}/`] = '/'
        redirects[`/${c.id}/emergency-help/`] = '/find-help/emergency-help/'
        redirects[`/${c.id}/severe-weather-accommodation/`] = '/find-help/severe-weather-accommodation/'
        redirects[`/${c.id}/bigchangemcr/`] = '/'
        redirects[`/${c.id}/bigchangemcr/about/`] = '/'
        redirects[`/${c.id}/bigchangemcr/campaign/`] = '/'
      })
  }
  const setCityToCity = () => {
    supportedCities.locations
      .filter((c) => c.isSelectableInBody)
      .forEach((c) => {
        supportedCities.locations
          .filter((c2) => c2.isSelectableInBody)
          .filter((c2) => c2.id !== c.id)
          .forEach((c2) => {
            redirects[`/${c.id}/`] = `/${c2.id}/`
            redirects[`/${c.id}/emergency-help/`] = `/${c2.id}/emergency-help/`
            redirects[`/${c.id}/severe-weather-accommodation/`] = `/${c2.id}/severe-weather-accommodation/`
            redirects[`/${c.id}/bigchangemcr/`] = `/${c2.id}/`
            redirects[`/${c.id}/bigchangemcr/about/`] = `/${c2.id}/`
            redirects[`/${c.id}/bigchangemcr/campaign/`] = `/${c2.id}/`
          })
      })
  }

  if (hasSelectedCity()) {
    setGenericToCity()
    setCityToCity()
  } else {
    setCityToGeneric()
  }

  const pathName = browser.location().pathname
  const result = redirects[pathName]

  if (result !== undefined && result.length) {
    browser.redirect(result)
  } else {
    browser.reload()
  }
}
