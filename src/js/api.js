var local = 'http://localhost:55881'
var dev = 'https://ssn-api-dev.azurewebsites.net'
var staging = 'https://ssn-api-uat.azurewebsites.net'
var live = 'https://ssn-api-prod.azurewebsites.net'

// Default the env to '1' for CI.
// This can be overwritten by running gulp with NODE_ENV=X gulp.
var env = process.env.NODE_ENV || 1

var envs = [local, dev, staging, live]

var domainRoot = envs[env]

if (!domainRoot) {
  throw new Error(`Environment ${env} not found`)
}

var p = function (url) {
  return domainRoot + url
}

module.exports = {
  getFullUrl: p,
  serviceProviders: p('/v2/service-providers/'),
  allServiceProviders: p('/v1/all-service-providers/'),
  serviceCategories: p('/v2/service-categories/'),
  categoryServiceProviders: p('/v2/categorised-service-providers/show/'),
  categoryServiceProvidersByDay: p('/v2/timetabled-service-providers/show/'),
  organisation: p('/v2/service-providers/show/'),
  needs: p('/v1/service-provider-needs/'),
  needsHAL: p('/v2/service-provider-needs/'),
  needCategories: p('/v1/service-provider-needs/categories'),
  createVolunteerEnquiry: p('/v1/volunteer-enquiries/'),
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
  accommodation: p('/v1/accommodation/')
}

