const browser = require('./browser')
const locationSelector = require('./location/locationSelector')

browser.redirect('/' + locationSelector.getSelectedLocationId() + '/severe-weather-accommodation')
