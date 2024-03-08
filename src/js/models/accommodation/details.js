// Common modules
import { Address, Coordinates } from './types'

const endpoints = require('../../api')
const getApiData = require('../../get-api-data')
const querystring = require('../../get-url-parameter')
const marked = require('marked')
marked.setOptions({ sanitize: true })
const htmlEncode = require('htmlencode')
const browser = require('../../browser')

const AccommodationDetails = function (renderCallback) {
  const self = this
  self.renderCallback = renderCallback

  self.viewModel = {}

  self.clean = (str) => {
    return marked(htmlEncode.htmlDecode(str))
  }

  self.formatGeneralInfo = (data) => {
    ['synopsis', 'description']
      .forEach((f) => {
        data[f] = self.clean(data[f])
      })
    return data
  }

  self.formatContactInformation = (data) => {
    ['additionalInfo']
      .forEach((f) => {
        data[f] = self.clean(data[f])
      })
    return data
  }

  self.formatFeatures = (features) => {
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
    features.additionalFeatures = self.clean(features.additionalFeatures)
    features.hasIndividualFeatures = keys.filter((k) => features[k] === true).length > 0
    features.hasContent = features.hasIndividualFeatures || features.additionalFeatures.length > 0

    return features
  }

  self.formatPricingAndReqs = (data) => {
    if (!data) return

    const textContentFields = ['featuresAvailableAtAdditionalCost', 'referralNotes', 'availabilityOfMeals']

    data.foodIsIncluded = data.foodIsIncluded === 1
    data.referralNotes = self.clean(data.referralNotes)
    data.featuresAvailableAtAdditionalCost = self.clean(data.featuresAvailableAtAdditionalCost)
    data.availabilityOfMeals = self.clean(data.availabilityOfMeals)
    data.hasContent = data.foodIsIncluded || textContentFields.filter((f) => data[f].length > 0).length > 0

    return data
  }

  self.formatSupportProvided = (data) => {
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
    data.supportInfo = self.clean(data.supportInfo)
    data.hasContent = data.supportOffered.length > 0 || data.supportInfo.length > 0 || data.hasOnSiteManager
    data.hasOnSiteManager = data.hasOnSiteManager === 1
    return data
  }

  self.formatResidentCriteria = (data) => {
    if (!data) return

    data.hasContent = Object.keys(data).filter((k) => data[k] === true).length > 0

    return data
  }

  self.build = () => {
    getApiData
      .data(`${endpoints.accommodation}/${querystring.parameter('id')}`)
      .then((result) => {
        const address = new Address(result.data.address)
        const coordinates = new Coordinates(result.data.address)
        self.viewModel = result.data

        self.viewModel.address.formattedAddress = address.formattedForDisplay()
        self.viewModel.contactInformation = self.formatContactInformation(result.data.contactInformation)
        self.viewModel.generalInfo = self.formatGeneralInfo(result.data.generalInfo)
        self.viewModel.features = self.formatFeatures(result.data.features)
        self.viewModel.pricingAndRequirements = self.formatPricingAndReqs(result.data.pricingAndRequirements)
        self.viewModel.supportProvided = self.formatSupportProvided(result.data.supportProvided)
        self.viewModel.residentCriteria = self.formatResidentCriteria(result.data.residentCriteria)
        self.viewModel.showMap = coordinates.areInitialised()

        self.viewModel.mapCoordinates = {
          latitude: result.data.address.latitude,
          longitude: result.data.address.longitude
        }

        self.renderCallback(self.viewModel)
      }, (e) => {
        browser.redirect('/500')
      })
  }
}

module.exports = AccommodationDetails
