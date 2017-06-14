let browser = require('./browser')
let locationSelector = require('./location/locationSelector')

browser.redirect('/' + locationSelector.getSelectedLocationId() + '/severe-weather-accommodation')
