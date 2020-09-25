// Common modules
import '../../common'
import ko from 'knockout'

const api = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const location = require('../../location/locationSelector')
const SearchFamilyAdvice = require('../../pages/families/search-family-advice/search-family-advice')

function Families () {
  const self = this
  self.searchFamilyAdvice = new SearchFamilyAdvice()
}

module.exports = Families
