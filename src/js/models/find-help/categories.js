import { categories } from '../../../data/generated/service-categories'

export const getData = (currentLocation) => {
  categories
    .forEach((category) => {
      if (category.key === 'meals' || category.key === 'dropin') {
        category.page = `${category.key}/timetable`
      } else if (category.key === 'accom') {
        category.page = 'accommodation'
      } else {
        category.page = `${category.key}`
      }
    })

  // Append object name for Hogan
  var theData = {
    categories: categories,
    location: currentLocation,
    emergencyHelpUrl: currentLocation.id === 'elsewhere'
      ? '/find-help/emergency-help/'
      : `/${currentLocation.id}/emergency-help/`
  }

  return theData
}
