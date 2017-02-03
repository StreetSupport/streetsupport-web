const apiRoutes = require('../../../api')
const querystring = require('../../../get-url-parameter')

const htmlEncode = require('htmlencode')
const marked = require('marked')
marked.setOptions({sanitize: true})

export const buildFindHelpUrl = (locationResult) => {
  const category = querystring.parameter('category')
  const location = querystring.parameter('location')
  const range = querystring.parameter('range')

  let url = apiRoutes.cities + locationResult.findHelpId + '/services/' + category
  if (location === 'my-location') {
    url = apiRoutes.servicesByCategory + category + '/' + locationResult.latitude + '/' + locationResult.longitude
  }
  url += '?range=' + range

  return url
}

export const getSubCategories = (providers) => {
  const toJustSubCats = (accumulator, provider) => [...accumulator, ...provider.subCategories]
  const toUnique = (acc, subcat) => {
    const match = acc.find((sc) => sc.id === subcat.id)
    const result = match === undefined
    ? [...acc, subcat]
    : acc
    return result
  }

  return providers
    .reduce(toJustSubCats, [])
    .reduce(toUnique, [])
}

export const getProvidersForListing = (providers) => {
  const groupOpeningTimes = (ungrouped) => {
    const toDictionary = (acc, curr) => {
      if (acc[curr.day] === undefined) {
        acc[curr.day] = [curr.startTime + '-' + curr.endTime]
      } else {
        acc[curr.day] = [...acc[curr.day], curr.startTime + '-' + curr.endTime]
      }
      return acc
    }

    const toDataStructure = (day) => {
      return {
        day: day,
        openingTimes: groupedByDay[day]
      }
    }

    const groupedByDay = ungrouped
      .reduce(toDictionary, {})

    return Object.keys(groupedByDay)
      .map(toDataStructure)
  }

  const extractService = (provider) => {
    provider.location.locationDescription = provider.locationDescription
    return {
      info: marked(htmlEncode.htmlDecode(provider.info)),
      location: provider.location,
      days: groupOpeningTimes(provider.openingTimes),
      servicesAvailable: provider.subCategories
        .map((sc) => sc.name)
        .join(', ')
    }
  }

  const formatNewProvider = (id, providersDictionary) => {
    const services = providersDictionary[id]
      .map((p) => extractService(p))
    const subCategories = providersDictionary[id]
      .reduce((acc, currProvider) => {
        return [...acc, ...currProvider.subCategories]
      }, [])

    const [head, ...tail] = providersDictionary[id] // eslint-disable-line

    return {
      providerId: head.serviceProviderId,
      providerName: head.serviceProviderName,
      services,
      tags: head.tags ? head.tags.join(', ') : [],
      subCategories: subCategories
    }
  }

  const toDictionary = (acc, p) => {
    if (acc[p.serviceProviderId] === undefined) {
      acc[p.serviceProviderId] = [p]
    } else {
      acc[p.serviceProviderId] = [...acc[p.serviceProviderId], p]
    }
    return acc
  }

  const providersDictionary = providers
    .reduce(toDictionary, {})

  const mapped = Object.keys(providersDictionary)
    .map((id) => formatNewProvider(id, providersDictionary))

  return mapped
}
