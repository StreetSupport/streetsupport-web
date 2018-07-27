const locationSelector = require('../location/locationSelector')

export class PostcodeProximity {
  constructor (range, onSearchCallback) {
    this.onSearchCallback = onSearchCallback

    this.range = document.querySelector('.js-find-help-range')
    this.updateSearchButton = document.querySelector('.js-update-search')
    this.postcode = document.querySelector('.js-location-search-postcode')
    this.form = document.querySelector('.form--proximity-search')
    this.setRange(range)

    const onSubmit = (e) => {
      e.preventDefault()
      locationSelector.setPostcode(this.postcode.value, (newLocationResult) => { // todo: level of abstraction not right?
        onSearchCallback(newLocationResult, this.range.value)
      }, (error) => {
        console.log(error)
        window.alert('The postcode could not be found. Please try a different one.')
      })
    }

    this.updateSearchButton.addEventListener('click', onSubmit)
    this.form.addEventListener('submit', onSubmit)
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
