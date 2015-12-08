var Holder = require('holderjs')

require.ensure(['./get-category-list', 'hogan.js'], function(require) {
	var getCategory = require('./get-category-list')
	var Hogan = require('hogan.js')

	// Get API data using promise
	var data = getCategory.data().then(function (result) {

		// Append object name for Hogan
		var theData = { categories : result }

		// Compile and render template
		var theTemplate = document.getElementById('js-category-list-tpl').innerHTML
		var compile = Hogan.compile(theTemplate)
		var theOutput = compile.render(theData)

		document.getElementById('js-category-list-output').innerHTML = theOutput

		// Load placeholder images
		Holder.run()
  })
})