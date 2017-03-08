const fs = require('fs')
const request = require('request')
const endpoints = require('../src/js/api')
const config = require('../foley.json')

request(endpoints.serviceCategories, function (error, response, body) {
  const cats = JSON.parse(body)
    .map((c) => {
      return {
        key: c.key,
        name: c.name
      }
    })
  const output = `export const serviceCategories = ${JSON.stringify(cats)}`
  fs.writeFileSync(`../${config.paths.generatedData}service-categories.js`, output)
})

request(endpoints.cities, function (error, response, body) {
  const output = `export const cities = ${body}`
  fs.writeFileSync(`../${config.paths.generatedData}supported-cities.js`, output)
})