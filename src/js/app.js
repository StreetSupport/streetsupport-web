// npm require
var FastClick = require('fastclick');
require('holderjs');

FastClick.attach(document.body);

// local require
var nav = require('./nav.js');

// app
$('.js-nav-open').on('click', function() {
  nav.open();
});

$('.js-nav-close').on('click', function() {
  nav.close();
});
