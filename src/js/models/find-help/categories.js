import { categories } from '../../../data/generated/service-categories'

const getPageUrl = (key) => {
  if (key === 'meals' || key === 'dropin') {
    return `${key}/timetable`
  } else if (key === 'accom') {
    return 'accommodation'
  } else {
    return `${key}`
  }
}

export const getData = (currentLocation, cities) => {
  console.log(cities)

  categories
    .forEach((category) => { category.page = getPageUrl(categories.key) })

  const result = {
    categories: categories,
    location: currentLocation,
    emergencyHelpUrl: currentLocation.id === 'elsewhere'
      ? '/find-help/emergency-help/'
      : `/${currentLocation.id}/emergency-help/`
  }

  const city = cities.find((c) => c.id === currentLocation.id)
  if (city) {
    result.location.swepIsAvailable = city.swepIsAvailable
  }

  return result
}
