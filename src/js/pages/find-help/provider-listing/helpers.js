const apiRoutes = require('../../../api')
const browser = require('../../../browser')
const querystring = require('../../../get-url-parameter')

const ko = require('knockout')
const htmlEncode = require('htmlencode')
const marked = require('marked')
marked.setOptions({ sanitize: true })

export const buildFindHelpUrl = (locationResult, range = querystring.parameter('range')) => {
  const re = new RegExp(/find-help\/(.*)\//)
  const category = browser.location().pathname.match(re)[1]
  return apiRoutes.servicesByCategory +
    category + '/' +
    locationResult.latitude + '/' +
    locationResult.longitude +
    '?range=' + range
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
    .sort((a, b) => {
      if (a.name < b.name) return -1
      if (a.name > b.name) return 1
      return 0
    })
}

const hasLocationDescription = (description) => {
  return description !== null && description !== undefined && description.length > 0
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
    const getFullAddress = (location) => {
      return htmlEncode.htmlDecode(`${[location.streetLine1, location.streetLine2, location.streetLine3, location.streetLine4, location.city]
        .filter((l) => l !== null && l.length > 0)
        .map((l) => l.trim())
        .join(', ')}. ${location.postcode.toUpperCase()}`)
    }

    provider.location.locationDescription = provider.locationDescription
    return {
      info: marked(htmlEncode.htmlDecode(provider.info)),
      location: provider.location,
      hasLocationDescription: hasLocationDescription(provider.locationDescription),
      locationDescription: provider.locationDescription,
      fullAddress: getFullAddress(provider.location),
      viewMapsUrl: `https://www.google.co.uk/maps/place/${provider.location.postcode}`,
      hasTelephone: provider.telephone !== null,
      telephone: provider.telephone,
      days: groupOpeningTimes(provider.openingTimes),
      isOpen247: provider.isOpen247,
      isTelephoneService: provider.isTelephoneService,
      isAppointmentOnly: provider.isAppointmentOnly,
      subCategoryIds: provider.subCategories
        .map((sc) => sc.id)
        .join(' '),
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

    const data = {
      providerId: head.serviceProviderId,
      providerName: htmlEncode.htmlDecode(head.serviceProviderName),
      providerPageUrl: `/find-help/organisation/?organisation=${head.serviceProviderId}`,
      services,
      tags: head.tags ? head.tags.join(', ') : '',
      subCategories: subCategories
    }

    return data
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

export const getServicesByDay = (dayServices) => {
  const getFullAddress = (location) => {
    return htmlEncode.htmlDecode(`${[location.street, location.street1, location.street2, location.street3, location.city]
      .filter((l) => l !== null && l.length > 0)
      .map((l) => l.trim())
      .join(', ')}. ${location.postcode.toUpperCase()}`)
  }

  const sortByOpeningTimes = (days) => {
    days.forEach(function (day) {
      day.isSelected = ko.observable(false)
      day.toggle = (e) => {
        day.isSelected(!day.isSelected())
      }
      day.serviceProviders = day.serviceProviders
        .sort((a, b) => {
          if (a.openingTime.startTime < b.openingTime.startTime) return -1
          if (a.openingTime.startTime > b.openingTime.startTime) return 1
          return 0
        })
      day.serviceProviders
        .forEach((sp) => {
          sp.name = htmlEncode.htmlDecode(sp.name)
          sp.orgUrl = `/find-help/organisation/?organisation=${sp.key}`
          sp.hasServiceInfo = hasLocationDescription(sp.serviceInfo)
          sp.hasLocationDescription = hasLocationDescription(sp.locationDescription)
          sp.fullAddress = getFullAddress(sp.address)
          sp.viewMapsUrl = `https://www.google.co.uk/maps/place/${sp.address.postcode}`
          sp.hasTelephone = sp.address.telephone !== null && sp.address.telephone.length > 0
          sp.hasTags = sp.tags.length > 0
          sp.isNotVisible = ko.observable(false)
        })
      day.hasServices = ko.computed(() => {
        return day.serviceProviders.filter(sp => !sp.isNotVisible()).length > 0
      }, day)
    })
    return days
  }

  function sortDaysFromToday (days) {
    // api days: monday == 0!
    var today = new Date().getDay() - 1
    var past = days.slice(0, today)
    var todayToTail = days.slice(today)
    return todayToTail.concat(past)
  }

  return sortByOpeningTimes(sortDaysFromToday(dayServices))
}
