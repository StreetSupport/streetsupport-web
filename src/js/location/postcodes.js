const ajaxGet = require('../get-api-data')
const storage = require('../storage')

const clean = (input) => {
  return input
    .replace(/\s/g, '')
    .toUpperCase()
}

const isOutcode = (postcode) => {
  return postcode && postcode.replace(/\s/g, '').length < 5
}

const postcodesDomain = 'https://api.postcodes.io/'

export const getByCoords = ({ latitude, longitude }, success, failure) => {
  const key = `${latitude},${longitude}`
  const cachedPostcode = storage.get(key)
  if (cachedPostcode) {
    success(cachedPostcode)
  } else {
    ajaxGet
      .data(`${postcodesDomain}postcodes?lon=${longitude}&lat=${latitude}`)
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
    const outcome = [
      { isOutcode: true, resourceName: 'outcodes', map: (result) => { result.postcode = result.outcode; return result } },
      { isOutcode: false, resourceName: 'postcodes', map: (result) => result }
    ]
      .find((oc) => oc.isOutcode === isOutcode(postcode))

    ajaxGet
      .data(`${postcodesDomain}${outcome.resourceName}/${postcode}`)
      .then((postcodeResult) => {
        if (postcodeResult.status === 'ok') {
          const result = outcome.map(postcodeResult.data.result)
          storage.set(clean(postcode), result)
          success(result)
        } else {
          failure()
        }
      }, failure)
  }
}
