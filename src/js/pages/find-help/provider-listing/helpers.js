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
