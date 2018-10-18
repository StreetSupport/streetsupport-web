var baseUrls = {
  "release": "https://www.streetsupport.net/",
  "uat": "https://ssn-web-uat.azurewebsites.net/",
  "develop": "https://ssn-web-dev.azurewebsites.net/"
}
var environment = process.env.TRAVIS_BRANCH || "release";

var tests = baseUrls[environment] != undefined ? ['./automated-tests/**/*.spec.js'] : [];


exports.config = {
  user: process.env.BROWSERSTACK_USERNAME,
  key: process.env.BROWSERSTACK_ACCESS_KEY,

  capabilities: [{
    browser: 'chrome'
  }, {
    browser: 'firefox'
  }, {
    browser: 'internet explorer'
  }, {
    browser: 'safari'
  }],

  framework: 'jasmine',

  specs: tests,

  maxInstances: 10,

  baseUrl: baseUrls[environment]
}
