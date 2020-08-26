// import ko from 'knockout'

const browser = require('../../../browser')
import { clientGroups } from '../../../../data/generated/client-groups'

export default class FindHelpClientGroup {
  constructor () {
    const re = new RegExp(/find-help\/group\/([\w]{1,}[\w-]*[a-zA-Z0-9]\+?)\//)
    this.clientGroupKey = browser.location().pathname.match(re)[1]
  }
}
