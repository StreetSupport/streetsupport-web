let templating = require('./template-render')
let locationSelector = require('./locationSelector')

templating.renderTemplate('js-template', locationSelector.viewModel, 'js-output', locationSelector.handler)
