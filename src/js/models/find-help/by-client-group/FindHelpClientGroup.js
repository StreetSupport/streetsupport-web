import ko from 'knockout'
import marked from 'marked'

const browser = require('../../browser')
import { clientGroups } from '../../../data/generated/client-groups'

export default class FindHelpClientGroup {
  constructor () {
    const re = new RegExp(/find-help\/([\w -]*[a-zA-Z]\+)\//)
    this.clientGroupId = browser.location().pathname.match(re)[1]
    const clientGroup = clientGroups.find((c) => c.key === this.clientGroupId)

    this.clientGroupName = ko.observable(clientGroup.name)
  }
}
