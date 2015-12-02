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

		var theOutput = JSON.stringify(result);

		document.getElementById('js-category-output').innerHTML=theOutput;
  });
});
