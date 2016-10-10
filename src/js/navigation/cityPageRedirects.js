const cityPageRedirects = {}

const leeds = '/leeds/'
const mcr = '/manchester/'

cityPageRedirects[leeds] = mcr
cityPageRedirects[leeds + 'emergency-help/'] = mcr + 'emergency-help/'

cityPageRedirects[mcr] = leeds
cityPageRedirects[mcr + 'emergency-help/'] = leeds + 'emergency-help/'
cityPageRedirects[mcr + 'bigchangemcr/'] = leeds
cityPageRedirects[mcr + 'bigchangemcr/about/'] = leeds
cityPageRedirects[mcr + 'bigchangemcr/fund/'] = leeds

module.exports = cityPageRedirects
