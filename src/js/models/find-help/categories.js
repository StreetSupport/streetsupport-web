import { categories } from '../../../data/generated/service-categories'

const getPageUrl = (key) => {
  switch (key) {
    case 'dropin': return `dropin/timetable`
    case 'accom': return `accommodation`
    default: return key
  }
}

export const getData = () => {
  categories
    .forEach((category) => { category.page = getPageUrl(category.key) })

  const result = {
    categories: categories
  }

  return result
}
