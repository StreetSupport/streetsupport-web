export const suffixer = (currentLocation) => {
  if (currentLocation.isSelectableInBody) {
    document.querySelector('.js-city-label')
      .innerHTML = ' in ' + currentLocation.name
  }
}
