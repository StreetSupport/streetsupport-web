const browser = require('./browser')
const querystring = require('./get-url-parameter')

const getValues = (d) => {
  return {
    qsKey: d.qsKey,
    qsValue: querystring.parameter(d.qsKey),
    currentValue: d.getValue()
  }
}

const anyValueHasChanged = (filters) => {
  return filters
    .reduce((acc, next) => {
      return acc
        ? true
        : next.qsValue !== next.currentValue
    }, false)
}

const buildQuerystring = (kvps) => {
  return kvps
    .map((kv) => `${kv.qsKey}=${kv.currentValue}`)
    .join('&')
}

const buildHistory = (kvps) => {
  const history = {}
  kvps
    .forEach((kvp) => {
      history[kvp.qsKey] = kvp.currentValue
    })
  return history
}

export default function push (filters) {
  const filtersAndValues = filters
    .map(getValues)

  if (anyValueHasChanged(filtersAndValues)) {
    const kvps = filtersAndValues
      .filter((kv) => kv.currentValue !== undefined)

    browser.pushHistory(buildHistory(kvps), '', `?${buildQuerystring(kvps)}`)
  }
}
