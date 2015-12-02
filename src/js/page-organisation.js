var shared = require('./shared');
var Holder = require('holderjs');

function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
  results = regex.exec(location.search);
  return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

require.ensure(['./get-organisation', 'hogan.js'], function(require) {
	var getCategory = require('./get-organisation');
	var Hogan = require('hogan.js');

	var organisation = getParameterByName('organisation');

	// Get API data using promise
	var data = getCategory.data(organisation).then(function (result) {

		// Append object name for Hogan
		var theData = { organisation : result };

		// Compile and render template
		var theTemplate = document.getElementById('js-organisation-tpl').innerHTML;
		var compile = Hogan.compile(theTemplate);
		var theOutput = compile.render(theData);

		document.getElementById('js-organisation-output').innerHTML=theOutput;

		console.log(theData);

  });
});
