// Common modules
import './common'

// Page modules
const templating = require('./template-render')

import { getData } from './models/find-help/categories'

templating.renderTemplate('js-category-list-tpl', getData(), 'js-category-list-output', () => { })
