const browser = require('../browser')
const supportedCities = require('../location/supportedCities')

export const redirectTo = (locationId) => {
  const redirects = {}
  const hasSelectedCity = () => locationId !== supportedCities.default().id
  const setGenericToCity = () => {
    redirects['/'] = `/${locationId}/`
    redirects['/find-help/emergency-help/'] = `/${locationId}/emergency-help/`
    redirects['/find-help/severe-weather-accommodation/'] = `/${locationId}/severe-weather-accommodation/`
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
        redirects[`/${c.id}/bigchangemcr/partners/`] = '/'
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
            redirects[`/${c.id}/`] = `/${locationId}/`
            redirects[`/${c.id}/emergency-help/`] = `/${locationId}/emergency-help/`
            redirects[`/${c.id}/severe-weather-accommodation/`] = `/${locationId}/severe-weather-accommodation/`
            redirects[`/${c.id}/bigchangemcr/`] = `/${locationId}/`
            redirects[`/${c.id}/bigchangemcr/about/`] = `/${locationId}/`
            redirects[`/${c.id}/bigchangemcr/campaign/`] = `/${locationId}/`
            redirects[`/${c.id}/bigchangemcr/partners/`] = `/${locationId}/`
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
