const ko = require('knockout')

const ajaxGet = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')

import { AccommodationDetails } from './types'

const Model = function () {
  this.dataIsLoaded = ko.observable(false)

  const init = () => {
    browser.loading()
    ajaxGet.data(`${endpoints.accommodation}/${querystring.parameter('id')}`)
      .then((result) => {
        this.model = new AccommodationDetails(result.data)
        this.dataIsLoaded(true)
        browser.loaded()
      }, () => {

      })
  }

  init()
}

module.exports = Model
