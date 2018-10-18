export const getSortAscFunc = function (fieldName) {
  return (a, b) => {
    if (a[fieldName] < b[fieldName]) return -1
    if (a[fieldName] > b[fieldName]) return 1
    return 0
  }
}

export const getSortDescFunc = function (fieldName) {
  return (a, b) => {
    if (a[fieldName] > b[fieldName]) return -1
    if (a[fieldName] < b[fieldName]) return 1
    return 0
  }
}

export const getKOSortAscFunc = function (fieldName) {
  return (a, b) => {
    if (a[fieldName]() < b[fieldName]()) return -1
    if (a[fieldName]() > b[fieldName]()) return 1
    return 0
  }
}

export const getKOSortDescFunc = function (fieldName) {
  return (a, b) => {
    if (a[fieldName]() > b[fieldName]()) return -1
    if (a[fieldName]() < b[fieldName]()) return 1
    return 0
  }
}
