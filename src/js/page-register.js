/*
  global $
*/

// Common modules
import './common'
import { cities } from '../data/generated/supported-cities'

const data = require('./register/data')
const schema = require('./register/schema')
const options = require('./register/options')
const view = require('./register/view')

function getAmendedSchema () {
  const ssnCities = cities
    .filter((c) => c.isOpenToRegistrations)
    .map((c) => c.id)
  schema.properties.associatedLocationIds.enum = ssnCities
  return schema
}

$(document).ready(function () {
  $('.alpaca-form').alpaca({
    data: data,
    schema: getAmendedSchema(),
    options: options,
    view: view
  })
})
