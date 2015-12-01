var shared = require('./shared');
var Holder = require('holderjs');

require(['./name'], function(pageName) {
	pageName("This is page-support");
});

require.ensure(['./get-category', 'hogan.js'], function(require) {
	var getCategory = require('./get-category');
	var Hogan = require('hogan.js');

	// Get API data using promise
	var data = getCategory.data().then(function (result) {

		// Append object name for Hogan
		var theData = { categories : result };

		// Compile and render template
		var theTemplate = document.getElementById('js-category-tpl').innerHTML;
		var compile = Hogan.compile(theTemplate);
		var theOutput = compile.render(theData);

		document.getElementById('js-category-output').innerHTML=theOutput;

		// Load placeholder images
		Holder.run();
  });
});
