/* global google */

// Common modules
import '../../../common'
import { Address, Coordinates } from '../../../models/accommodation/types'

const browser = require('../../../browser')
const endpoints = require('../../../api')
const getApiData = require('../../../get-api-data')
const querystring = require('../../../get-url-parameter')
const templating = require('../../../template-render')
const marked = require('marked')
marked.setOptions({ sanitize: true })
const htmlEncode = require('htmlencode')

const initMap = () => {
  const centre = { lat: mapCoordinates.latitude, lng: mapCoordinates.longitude }
  const map = new google.maps.Map(document.querySelector('.js-map'), {
    zoom: 15,
    center: centre
  })

  new google.maps.Marker({ // eslint-disable-line
    position: centre,
    map: map
  })
}

const clean = (str) => {
  return marked(htmlEncode.htmlDecode(str))
}

const onRenderCallback = () => {
  browser.loaded()
  initMap()
}

const formatGeneralInfo = (data) => {
  ['synopsis', 'description']
    .forEach((f) => {
      data[f] = clean(data[f])
    })
  return data
}

const formatContactInformation = (data) => {
  ['additionalInfo']
    .forEach((f) => {
      data[f] = clean(data[f])
    })
  return data
}

const formatFeatures = (features) => {
  const keys = [
    'acceptsPets',
    'hasDisabledAccess',
    'hasSingleRooms',
    'hasSharedRooms',
    'hasShowerBathroomFacilities',
    'hasAccessToKitchen',
    'hasFlexibleMealTimes',
    'hasLounge',
    'hasLaundryFacilities',
    'providesCleanBedding',
    'allowsVisitors']
  keys
    .forEach((f) => {
      features[f] = features[f] === 1
    })
  features.additionalFeatures = clean(features.additionalFeatures)
  features.hasIndividualFeatures = keys.filter((k) => features[k] === true).length > 0
  features.hasContent = features.hasIndividualFeatures || features.additionalFeatures.length > 0

  return features
}

const formatPricingAndReqs = (data) => {
  if (!data) return

  const textContentFields = ['featuresAvailableAtAdditionalCost', 'referralNotes', 'availabilityOfMeals']

  data.foodIsIncluded = data.foodIsIncluded === 1
  data.referralNotes = clean(data.referralNotes)
  data.featuresAvailableAtAdditionalCost = clean(data.featuresAvailableAtAdditionalCost)
  data.availabilityOfMeals = clean(data.availabilityOfMeals)
  data.hasContent = data.foodIsIncluded || textContentFields.filter((f) => data[f].length > 0).length > 0

  return data
}

const formatSupportProvided = (data) => {
  if (!data) return
  const supportTypes = [
    { key: 'alcohol', name: 'Alcohol' },
    { key: 'domestic violence', name: 'Domestic Violence' },
    { key: 'mental health', name: 'Mental Health' },
    { key: 'physical health', name: 'Physical Health' },
    { key: 'substances', name: 'Drug Dependency' }
  ]
  data.supportOffered = data.supportOffered
    .map((s) => supportTypes.find(kv => kv.key === s).name)
  data.supportInfo = clean(data.supportInfo)
  data.hasContent = data.supportOffered.length > 0 || data.supportInfo.length > 0 || data.hasOnSiteManager
  return data
}

const formatResidentCriteria = (data) => {
  if (!data) return

  data.hasContent = Object.keys(data).filter((k) => data[k] === true).length > 0

  return data
}

browser.loading()

let mapCoordinates = {}
let viewModel = {}

export const renderView = () => {
  getApiData
    .data(`${endpoints.accommodation}/${querystring.parameter('id')}`)
    .then((result) => {
      let address = new Address(result.data.address)
      let coordinates = new Coordinates(result.data.address)

      viewModel = result.data

      viewModel.address.formattedAddress = address.formattedForDisplay()
      viewModel.contactInformation = formatContactInformation(result.data.contactInformation)
      viewModel.generalInfo = formatGeneralInfo(result.data.generalInfo)
      viewModel.features = formatFeatures(result.data.features)
      viewModel.pricingAndRequirements = formatPricingAndReqs(result.data.pricingAndRequirements)
      viewModel.supportProvided = formatSupportProvided(result.data.supportProvided)
      viewModel.residentCriteria = formatResidentCriteria(result.data.residentCriteria)
      viewModel.showMap = coordinates.areInitialised()

      mapCoordinates.latitude = result.data.address.latitude
      mapCoordinates.longitude = result.data.address.longitude

      templating.renderTemplate('js-template', viewModel, 'js-template-placeholder', onRenderCallback)
    }, (e) => {
      browser.redirect('/500')
    })
}

renderView()


