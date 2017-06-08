/* global localStorage */

const ajaxGet = require('../get-api-data')

export const getByCoords = ({latitude, longitude}, success, failure) => {
  // let cachedPostcode = localStorage.getItem('postcode')
  // if (cachedPostcode) {
  //   success(cachedPostcode)
  // } else {
    ajaxGet
      .data(`https://api.postcodes.io/postcodes?lon=${longitude}&lat=${latitude}`)
      .then((postcodeResult) => {
        const postcode = postcodeResult.data.result[0].postcode
        // localStorage.setItem('postcode', postcode)
        success(postcode)
      }, failure)
  // }
}
