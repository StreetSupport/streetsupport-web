const browser = require('../../browser')
const SearchFamilyAdviceModule = require('../../pages/families/search-family-advice/search-family-advice')

function Families () {
  const self = this
  self.searchFamilyAdvice = new SearchFamilyAdviceModule.SearchFamilyAdvice()

  self.redirectToSupport = function () {
    browser.redirect('https://streetsupport.net/')
  } 
}

module.exports = Families
