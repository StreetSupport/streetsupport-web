const htmlEncode = require('htmlencode')
const querystring = require('../../get-url-parameter')
const SearchFamilyAdvice = require('../../pages/families/search-family-advice/search-family-advice')

function FamilyAdviceResult () {
  const self = this
  const searchQueryInQuerystring = querystring.parameter('searchQuery')
  self.searchFamilyAdvice = new SearchFamilyAdvice()
  self.searchFamilyAdvice.advice.subscribe((newValue) => {
    self.searchFamilyAdvice.searchQuery(htmlEncode.htmlDecode(searchQueryInQuerystring.trim()))
  })
}

module.exports = FamilyAdviceResult
