const apiRoutes = require('../../../api')
const querystring = require('../../../get-url-parameter')

export const buildFindHelpUrl = (locationResult) => {
  let category = querystring.parameter('category')
  let location = querystring.parameter('location')
  let range = querystring.parameter('range')

  let url = apiRoutes.cities + locationResult.findHelpId + '/services/' + category
  if (location === 'my-location') {
    url = apiRoutes.servicesByCategory + category + '/' + locationResult.latitude + '/' + locationResult.longitude
  }
  url += '?range=' + range

  return url
}

export const groupOpeningTimes = (ungrouped) => {
  const grouped = []
  for (let i = 0; i < ungrouped.length; i++) {
    const curr = ungrouped[i]
    const sameDay = grouped.filter((d) => d.day === curr.day)
    if (sameDay.length === 0) {
      grouped.push({
        day: curr.day,
        openingTimes: [curr.startTime + '-' + curr.endTime]
      })
    } else {
      sameDay[0].openingTimes.push(curr.startTime + '-' + curr.endTime)
    }
  }
  return grouped
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
  const extractService = (provider) => {
    provider.location.locationDescription = provider.locationDescription
    return {
      info: provider.info,
      location: provider.location,
      days: groupOpeningTimes(provider.openingTimes),
      servicesAvailable: provider.subCategories
        .map((sc) => sc.name)
        .join(', ')
    }
  }

  const updateProvider = (existingProvider, newService, newSubCategories) => {
    existingProvider.services.push(newService)
    existingProvider.subCategories = existingProvider.subCategories.concat(newSubCategories)
  }

  const formatNewProvider = (provider, service) => {
    return {
      providerId: provider.serviceProviderId,
      providerName: provider.serviceProviderName,
      services: [service],
      tags: provider.tags ? provider.tags.join(', ') : [],
      subCategories: provider.subCategories
    }
  }

  const formattedProviders = []

  for (const provider of providers) {
    const service = extractService(provider)
    const match = formattedProviders.find((p) => p.providerId === provider.serviceProviderId)
    if (match) {
      updateProvider(match, service, provider.subCategories)
    } else {
      formattedProviders.push(formatNewProvider(provider, service))
    }
  }

  return formattedProviders
}
