var live = 'http://api.streetsupport.net'
var dev = 'http://localhost:55881' // eslint-disable-line

var domainRoot = dev

var serviceProvidersUrl = '/v1/service-providers/'
var serviceCategoriesUrl = '/v1/service-categories/'
var categoryServiceProvidersUrl = '/v1/categorised-service-providers/show/'
var categoryServiceProvidersWithSubsUrl = '/v2/categorised-service-providers/show/'
var organisationUrl = '/v1/service-providers/show/'

module.exports = {
  serviceProviders: domainRoot + serviceProvidersUrl,
  serviceCategories: domainRoot + serviceCategoriesUrl,
  categoryServiceProviders: domainRoot + categoryServiceProvidersUrl,
  subCategoryServiceProviders: domainRoot + categoryServiceProvidersWithSubsUrl,
  organisation: domainRoot + organisationUrl
}
