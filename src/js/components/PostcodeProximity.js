const locationSelector = require('../location/locationSelector')

export class PostcodeProximity {
  constructor (range, onSearchCallback) {
    this.onSearchCallback = onSearchCallback

    this.range = document.querySelector('.js-find-help-range')
    this.updateSearchButton = document.querySelector('.js-update-search')
    this.postcode = document.querySelector('.js-location-search-postcode')

    this.setRange(range)
    this.updateSearchButton.addEventListener('click', (e) => {
      e.preventDefault()
      locationSelector.setPostcode(this.postcode.value, (newLocationResult) => { // todo: level of abstraction not right?
        onSearchCallback(newLocationResult, this.range.value)
      }, (error) => {
        console.log(error)
        window.alert('The postcode could not be found. Please try a different one.')
      })
    }, () => {
      console.log('error')
    })
  }

  setRange (newValue) {
    Array.from(this.range.children)
      .forEach((c) => {
        if (parseInt(c.value) === parseInt(newValue)) {
          c.setAttribute('selected', 'selected')
        }
      })
  }
}