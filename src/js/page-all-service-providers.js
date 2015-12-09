var shared = require('./shared')
var Holder = require('holderjs')
var _ = require('lodash')

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search)
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "))
}

require.ensure(['./get-all-providers', 'hogan.js'], function(require) {
	var getCategory = require('./get-all-providers')
	var Hogan = require('hogan.js')

	// Get API data using promise
	var data = getCategory.data().then(function (result) {

		var sorted = _.sortBy(result, function(provider) {
			return provider.name
		})

		// Append object name for Hogan
		var theData = { organisations : sorted }

		// Compile and render category template
		var theCategoryTemplate = document.getElementById('js-category-result-tpl').innerHTML
		var compileCategory = Hogan.compile(theCategoryTemplate)
		var theCategoryOutput = compileCategory.render(theData)

		document.getElementById('js-category-result-output').innerHTML=theCategoryOutput
  })
})
