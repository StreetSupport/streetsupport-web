var shared = require('./shared');

require(['./name'], function(pageName) {
	pageName("This is page-support");
});

require.ensure(['./get-category', 'hogan.js'], function(require) {
	var getCategory = require('./get-category');
	var Hogan = require('hogan.js');

	var data = getCategory.data().then(function (result) {
  	console.log(result);
  });
});
