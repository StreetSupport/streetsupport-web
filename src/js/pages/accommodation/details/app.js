// Common modules
import '../../../common'

const browser = require('../../../browser')
const endpoints = require('../../../api')
const getApiData = require('../../../get-api-data')
const querystring = require('../../../get-url-parameter')
const templating = require('../../../template-render')

const onRenderCallback = () => {
  browser.loaded()
}

const formatAddress = (addressObj) => {
  const addressParts = ['street1', 'street2', 'street3', 'city']
  const formattedAddress = addressParts
    .map((p) => addressObj[p].trim())
    .filter((p) => p.length > 0)
    .join(', ')
  return `${formattedAddress}. ${addressObj.postcode}`
}

const formatSupportOffered = (supportOffered) => {
  if (supportOffered.length === 0) return 'None'
  return supportOffered.join(', ')
}

const formatFeatures = (features) => {
  const readable = ['No', 'Yes', 'Don\'t Know/Ask']
  const boolDiscFields = ['acceptsHousingBenefit', 'acceptsNoHousingBenefitWithServiceProviderSupport', 'acceptsPets', 'acceptsCouples', 'hasDisabledAccess', 'isSuitableForWomen', 'isSuitableForYoungPeople', 'hasSingleRooms', 'hasSharedRooms', 'hasShowerBathroomFacilities', 'hasAccessToKitchen', 'hasFlexibleMealTimes', 'hasLounge', 'providesCleanBedding', 'allowsVisitors', 'allowsChildren', 'hasOnSiteManager', 'referenceReferralIsRequired', 'foodIsIncluded']
  boolDiscFields
    .forEach((f) => {
      features[`${f}Formatted`] = readable[features[f]]
    })
  return features
}

browser.loading()

getApiData
  .data(`${endpoints.accommodation}/${querystring.parameter('id')}`)
  .then((result) => {
  console.log(result.data.features)
    result.data.address.formattedAddress = formatAddress(result.data.address)
    result.data.generalInfo.formattedSupportOffered = formatSupportOffered(result.data.generalInfo.supportOffered)
    result.data.features = formatFeatures(result.data.features)

    templating.renderTemplate('js-template', result.data, 'js-template-placeholder', onRenderCallback)
  }, (e) => {
    browser.redirect('/500')
  })
