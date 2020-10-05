const browser = require('../../../browser')

export default class GiveHelpClientGroup {
  constructor () {
    const re = new RegExp(/give-help\/help\/group\/([\w]{1,}[\w-]*[a-zA-Z0-9]\+?)\//)
    this.clientGroupKey = browser.location().pathname.match(re)[1]
  }
}
