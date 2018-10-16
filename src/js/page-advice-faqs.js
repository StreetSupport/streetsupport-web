import './common'

const marked = require('marked')
const htmlencode = require('htmlencode')

const accordion = require('./accordion')
const apiRoutes = require('./api')
const getApiData = require('./get-api-data')
const locationSelector = require('./location/locationSelector')
const templating = require('./template-render')

const locationId = locationSelector.getSelectedLocationId()

getApiData
  .data(`${apiRoutes.faqs}?location=${locationId}`)
  .then((result) => {
    result.data.items
      .forEach((i) => {
        console.log(i.body, marked(i.body))
        i.body = marked(htmlencode.htmlDecode(i.body))
      })
    const data = {
      items: result.data.items
    }
    templating.renderTemplate('js-faqs-tpl', data, 'js-faqs-output', () => { 
      accordion.init(false, -1)
    })
  })
  