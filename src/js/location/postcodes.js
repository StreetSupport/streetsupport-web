const ajaxGet = require('../get-api-data')
const storage = require('../storage')

const clean = (input) => {
  return input
    .replace(/\s/g, '')
    .toUpperCase()
}

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
        storage.set(clean(postcode), {
          postcode: postcode,
          longitude: longitude,
          latitude: latitude
        })
        success(postcode)
      }, failure)
  }
}

export const getCoords = (postcode, success, failure) => {
  const cachedPostcode = storage.get(clean(postcode))
  if (cachedPostcode) {
    success(cachedPostcode)
  } else {
    if (isOutcode(postcode)) {
      ajaxGet
        .data(`https://api.postcodes.io/outcodes/${postcode}`)
        .then((postcodeResult) => {
          if (postcodeResult.status === 'ok') {
            const result = {
              postcode: postcodeResult.data.result.postcode,
              longitude: postcodeResult.data.result.longitude,
              latitude: postcodeResult.data.result.latitude
            }
            storage.set(clean(postcode), result)
            success(result)
          } else {
            failure()
          }
        }, failure)
    } else {
      ajaxGet
      .data(`https://api.postcodes.io/postcodes/${postcode}`)
      .then((postcodeResult) => {
        if (postcodeResult.status === 'ok') {
          const result = {
            postcode: postcodeResult.data.result.postcode,
            longitude: postcodeResult.data.result.longitude,
            latitude: postcodeResult.data.result.latitude
          }
          storage.set(clean(postcode), result)
          success(result)
        } else {
          failure()
        }
      }, failure)
    }
  }
}

const isOutcode = (postcode) => {
  return postcode && postcode.replace(/\s/g, '').length < 5;
}