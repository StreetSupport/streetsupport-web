// Common modules
import '../../common'
import ko from 'knockout'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')
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
