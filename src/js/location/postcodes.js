const ajaxGet = require('../get-api-data')
const storage = require('../storage')

export const getByCoords = ({latitude, longitude}, success, failure) => {
  const key = `${latitude},${longitude}`
  const cachedPostcode = storage.get(key)
  if (cachedPostcode) {
    success(cachedPostcode)
  } else {
    ajaxGet
      .data(`https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}`)
      .then((postcodeResult) => {
        const postcode = postcodeResult.data.result[0].postcode
        storage.set(key, postcode)
        success(postcode)
      }, failure)
  }
}

export const getCoords = (postcode, success, failure) => {
  ajaxGet
    .data(`https://api.postcodes.io/postcodes/${postcode}`)
    .then((postcodeResult) => {
      if (postcodeResult.status === 'ok') {
        storage.set('postcode', postcode)
        success(postcodeResult.data.result)
      } else {
        failure()
      }
    }, failure)
}
