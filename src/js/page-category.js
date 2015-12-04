var shared = require('./shared');
var Holder = require('holderjs');
var _ = require('lodash');

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

require.ensure(['./get-category-result', 'hogan.js'], function(require) {
	var getCategory = require('./get-category-result');
	var Hogan = require('hogan.js');

	var category = getParameterByName('category');

	// Get API data using promise
	var data = getCategory.data(category).then(function (result) {

		_.forEach(result.serviceProviders, function(org) {
			org.requestedService = _.find(org.servicesProvided, function(service) {
				return service.name === category
			})
		})

		// Append object name for Hogan
		var theData = { organisations : result };

		// Compile and render header template
		var theHeaderTemplate = document.getElementById('js-category-header-tpl').innerHTML;
		var compileHeader = Hogan.compile(theHeaderTemplate);
		var theHeaderOutput = compileHeader.render(theData);

		document.getElementById('js-category-header-output').innerHTML=theHeaderOutput;

		// Compile and render category template
		var theCategoryTemplate = document.getElementById('js-category-result-tpl').innerHTML;
		var compileCategory = Hogan.compile(theCategoryTemplate);
		var theCategoryOutput = compileCategory.render(theData);

		document.getElementById('js-category-result-output').innerHTML=theCategoryOutput;
  });
});
