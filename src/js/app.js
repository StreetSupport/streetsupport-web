// npm require
var holder = require('holderjs');
var FastClick = require('fastclick');

FastClick.attach(document.body);

// local require
var nav = require('./nav.js');

nav.open();
nav.close();
