var shared = require('./shared');
var Holder = require('holderjs');

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

		// Append object name for Hogan
		var theData = { organisations : result };

		// Compile and render template
		var theTemplate = document.getElementById('js-category-result-tpl').innerHTML;
		var compile = Hogan.compile(theTemplate);
		var theOutput = compile.render(theData);

		document.getElementById('js-category-result-output').innerHTML=theOutput;

		console.log(theData);

  });
});
