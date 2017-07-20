import { categories } from '../../../data/generated/service-categories'

const getPageUrl = (key) => {
  switch (key) {
    case 'meals': return `meals/timetable`
    case 'dropin': return `dropin/timetable`
    case 'accom': return `accommodation`
    default: return key
  }
}

export const getData = (currentLocation, cities) => {
  categories
    .forEach((category) => { category.page = getPageUrl(category.key) })

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
