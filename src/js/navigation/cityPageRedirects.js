const cityPageRedirects = {}

const leeds = '/leeds/'
const mcr = '/manchester/'

cityPageRedirects[leeds] = mcr
cityPageRedirects[leeds + 'emergency-help/'] = mcr + 'emergency-help/'
cityPageRedirects[leeds + 'severe-weather-accommodation/'] = mcr + 'severe-weather-accommodation/'

cityPageRedirects[mcr] = leeds
cityPageRedirects[mcr + 'emergency-help/'] = leeds + 'emergency-help/'
cityPageRedirects[mcr + 'severe-weather-accommodation/'] = leeds + 'severe-weather-accommodation/'
cityPageRedirects[mcr + 'bigchangemcr/'] = leeds
cityPageRedirects[mcr + 'bigchangemcr/about/'] = leeds
cityPageRedirects[mcr + 'bigchangemcr/fund/'] = leeds

module.exports = cityPageRedirects
