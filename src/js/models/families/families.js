const SearchFamilyAdviceModule = require('../../pages/families/search-family-advice/search-family-advice')

function Families () {
  const self = this
  self.searchFamilyAdvice = new SearchFamilyAdviceModule.SearchFamilyAdvice()
}

module.exports = Families
