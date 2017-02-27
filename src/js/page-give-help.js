import './common'

let locationSelector = require('./location/locationSelector')
let templating = require('./template-render')
import { suffixer } from './location/suffixer'

locationSelector
  .getCurrent()
  .then((result) => {
    let theData = {
      isManchester: result.id === 'manchester'
    }
    let callback = () => {
      suffixer(result)
    }
    templating.renderTemplate('js-charter-tpl', theData, 'js-charter-output', callback)
  }, (_) => {

  })
