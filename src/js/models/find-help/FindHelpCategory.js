import ko from 'knockout'
import marked from 'marked'

const browser = require('../../browser')
import { categories } from '../../../data/generated/service-categories'

export default class FindHelpCategory {
  constructor () {
    const re = new RegExp(/find-help\/([\w -]*[a-zA-Z])\//)
    this.categoryId = browser.location().pathname.match(re)[1]
    const category = categories.find((c) => c.key === this.categoryId)

    this.categoryName = ko.observable(category.name)
    this.categorySynopsis = ko.observable(marked(category.synopsis))
  }
}
