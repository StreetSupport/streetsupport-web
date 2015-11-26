var nav = require('./nav.js');

console.log('testing if jquery is loaded globally:');
console.log($);

$('.js-nav-open').on('click', function() {
  nav.open();
});

$('.js-nav-close').on('click', function() {
  nav.close();
});
