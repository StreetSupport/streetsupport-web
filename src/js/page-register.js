// Common modules
import './common'

let data = require('./register/data')
let schema = require('./register/schema')
let options = require('./register/options')
let view = require('./register/view')

$(document).ready(function () {
  $('.alpaca-form').alpaca({
    'data': data,
    'schema': schema,
    'options': options,
    'view': view
  })
})
