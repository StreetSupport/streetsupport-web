/* global google */

import '../../../common'

const ViewModel = require('./../../../models/accommodation/details')
const templating = require('./../../../template-render')
const browser = require('./../../../browser')

const initMap = (centre) => {
  const map = new google.maps.Map(document.querySelector('.js-map'), {
    zoom: 15,
    center: centre
  })

  new google.maps.Marker({ // eslint-disable-line
    position: centre,
    map: map
  })
}

const onRenderCallback = (viewModel) => {
  browser.loaded()
  initMap(viewModel.mapCoordinates)
}

const renderCallback = (viewModel) => {
  templating.renderTemplate('js-template', viewModel, 'js-template-placeholder', onRenderCallback)
}

let viewModel = new ViewModel(renderCallback)

browser.loading()
viewModel.build()
