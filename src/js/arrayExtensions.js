Array.prototype.sortVSL = function (fieldName, isAscending = true) {
  const sortResult = isAscending ? -1 : 1
  return this
    .sort((a, b) => {
      if (a[fieldName] < b[fieldName]) return sortResult
      if (a[fieldName] > b[fieldName]) return -sortResult
      return 0
    })
}

Array.prototype.sortAsc = function (fieldName) {
  return this.sortVSL(fieldName)
}

Array.prototype.sortDesc = function (fieldName) {
  return this.sortVSL(fieldName, false)
}
