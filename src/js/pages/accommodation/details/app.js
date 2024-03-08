import '../../../common'

const ViewModel = require('./../../../models/accommodation/details')
const templating = require('./../../../template-render')
const browser = require('./../../../browser')
const googleMaps = require('./../../../location/googleMaps')

const initMap = (centre) => {
  const map = googleMaps.buildMap(centre, { zoom: 15 })
  googleMaps.buildMarker(centre, map)
}

const onRenderCallback = (viewModel) => {
  browser.loaded()
  initMap(viewModel.mapCoordinates)
}

const renderCallback = (viewModel) => {
  templating.renderTemplate('js-template', viewModel, 'js-template-placeholder', onRenderCallback)
}

const viewModel = new ViewModel(renderCallback)

browser.loading()
viewModel.build()
