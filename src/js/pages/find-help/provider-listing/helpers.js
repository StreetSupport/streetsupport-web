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

export const formatProviderData = (providers) => {
  const formattedProviders = []
  const subCategories = []

  for (const provider of providers) {
    provider.location.locationDescription = provider.locationDescription
    const service = {
      info: provider.info,
      location: provider.location,
      days: groupOpeningTimes(provider.openingTimes),
      servicesAvailable: provider.subCategories
        .map((sc) => sc.name)
        .join(', ')
    }
    const match = formattedProviders.filter((p) => p.providerId === provider.serviceProviderId)

    if (match.length === 1) {
      match[0].services.push(service)
      match[0].subCategories = match[0].subCategories.concat(provider.subCategories)
    } else {
      const newProvider = {
        providerId: provider.serviceProviderId,
        providerName: provider.serviceProviderName,
        services: [service]
      }
      if (provider.tags !== null) {
        newProvider.tags = provider.tags.join(', ')
      }
      if (provider.subCategories !== null) {
        for (const sc of provider.subCategories) {
          if (subCategories.filter((esc) => esc.id === sc.id).length === 0) {
            subCategories.push(sc)
          }
        }

        newProvider.subCategories = provider.subCategories
      }
      formattedProviders.push(newProvider)
    }
  }

  return {
    formattedProviders: getProvidersForListing(providers),
    subCategories
  }
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
