var local = 'http://localhost:55881'
var dev = 'https://ssn-api-dev.azurewebsites.net'
var staging = 'https://ssn-api-uat.azurewebsites.net'
var live = 'https://ssn-api-prod.azurewebsites.net'

var env = require('./env')

var envs = [local, dev, staging, live]

var domainRoot = envs[env]

var p = function (url) {
  return domainRoot + url
}

module.exports = {
  getFullUrl: p,
  serviceProviders: p('/v2/service-providers/'),
  allServiceProviders: p('/v1/all-service-providers/'),
  serviceProviderLocations: p('/v1/service-provider-locations/'),
  serviceCategories: p('/v2/service-categories/'),
  categoryServiceProviders: p('/v2/categorised-service-providers/show/'),
  categoryServiceProvidersByDay: p('/v2/timetabled-service-providers/show/'),
  organisation: p('/v2/service-providers/show/'),
  needs: p('/v2/service-provider-needs/'),
  needCategories: p('/v1/service-provider-needs/categories'),
  createVolunteerEnquiry: p('/v1/volunteer-enquiries/'),
  volunteerCategories: p('/v1/volunteer-categories/'),
  createOfferOfItems: p('/v1/offers-of-items/'),
  joinStreetSupportApplications: p('/v1/join-street-support-applications/'),
  offerSponsorship: p('/v1/sponsorship-offers/'),
  servicesByCategory: p('/v2/service-categories/'),
  newlyRegisteredProviders: p('/v1/newly-registered-providers'),
  cities: p('/v1/cities/'),
  statistics: p('/v1/statistics/'),
  impactUpdates: p('/v1/impact-updates/'),
  analyticsSnapshot: p('/v1/analytics-statistics/'),
  bestPracticeAwardApplications: p('/v1/manchester-best-practice-awards/applications/'),
  bestPracticeEnquiries: p('/v1/manchester-best-practice-enquiries/'),
  accommodation: p('/v1/accommodation/'),
  faqs: p('/v1/faqs/')
}

