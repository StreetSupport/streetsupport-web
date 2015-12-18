var dev = 'http://localhost:55881' // eslint-disable-line
var staging = 'http://streetsupport-api-staging.apphb.com' // eslint-disable-line
var live = 'http://api.streetsupport.net' // eslint-disable-line

var domainRoot = live

var serviceProvidersUrl = '/v2/service-providers/'
var serviceCategoriesUrl = '/v2/service-categories/'
var categoryServiceProvidersUrl = '/v2/categorised-service-providers/show/'
var categoryServiceProvidersByDayUrl = '/v2/timetabled-service-providers/show/'
var organisationUrl = '/v2/service-providers/show/'

module.exports = {
  serviceProviders: domainRoot + serviceProvidersUrl,
  serviceCategories: domainRoot + serviceCategoriesUrl,
  categoryServiceProviders: domainRoot + categoryServiceProvidersUrl,
  categoryServiceProvidersByDay: domainRoot + categoryServiceProvidersByDayUrl,
  organisation: domainRoot + organisationUrl
}
