/* global google */

// Common modules
import '../../../common'
import { Address, Coordinates } from '../../../models/accommodation/types'

const endpoints = require('../../../api')
const getApiData = require('../../../get-api-data')
const querystring = require('../../../get-url-parameter')
const templating = require('../../../template-render')
const marked = require('marked')
marked.setOptions({ sanitize: true })
const htmlEncode = require('htmlencode')
const browser = require('../../../browser')

function AccommodationDetails () {
  const self = this
  let mapCoordinates = {}
  let viewModel = {}

  self.initMap = () => {
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
    return data
  }

  self.formatResidentCriteria = (data) => {
    if (!data) return

    data.hasContent = Object.keys(data).filter((k) => data[k] === true).length > 0

    return data
  }

  self.onRenderCallback = () => {
    browser.loaded()
    self.initMap()
  }

  self.render = () => {
    getApiData
      .data(`${endpoints.accommodation}/${querystring.parameter('id')}`)
      .then((result) => {
        let address = new Address(result.data.address)
        let coordinates = new Coordinates(result.data.address)

        viewModel = result.data

        viewModel.address.formattedAddress = address.formattedForDisplay()
        viewModel.contactInformation = self.formatContactInformation(result.data.contactInformation)
        viewModel.generalInfo = self.formatGeneralInfo(result.data.generalInfo)
        viewModel.features = self.formatFeatures(result.data.features)
        viewModel.pricingAndRequirements = self.formatPricingAndReqs(result.data.pricingAndRequirements)
        viewModel.supportProvided = self.formatSupportProvided(result.data.supportProvided)
        viewModel.residentCriteria = self.formatResidentCriteria(result.data.residentCriteria)
        viewModel.showMap = coordinates.areInitialised()

        mapCoordinates.latitude = result.data.address.latitude
        mapCoordinates.longitude = result.data.address.longitude

        templating.renderTemplate('js-template', viewModel, 'js-template-placeholder', self.onRenderCallback)
      }, (e) => {
        browser.redirect('/500')
      })
  }
}

module.exports = AccommodationDetails
