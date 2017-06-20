/*
  global $
*/

// Common modules
import './common'

const data = require('./register/data')
const schema = require('./register/schema')
const options = require('./register/options')
const view = require('./register/view')
import { cities } from '../data/generated/supported-cities'

function getAmendedSchema () {
  schema.properties.associatedCity.enum = cities
    .filter((c) => c.isOpenToRegistrations)
    .map((c) => c.id)
  return schema
}

$(document).ready(function () {
  $('.alpaca-form').alpaca({
    'data': data,
    'schema': getAmendedSchema(),
    'options': options,
    'view': view
  })
})
