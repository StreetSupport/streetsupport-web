// Page modules
var FastClick = require('fastclick')
var nav = require('./nav.js')
var socialShare = require('./social-share')
var analytics = require('./analytics')
var awesomplete = require('imports?this=>window!../../node_modules/awesomplete/awesomplete.js')
import List from 'list.js'
import Holder from 'holderjs'

nav.init()
analytics.init()
FastClick.attach(document.body)

// Run Holder
Holder.run({})

var options = {
  valueNames: [ 'type', 'organisation', 'description' ],
  item: '<li><h3 class="h3 type"></h3><p class="organisation"></p><p class="description"></p></li>'
}

var values = [
  { type: 'people', organisation: 'Mad Dogs', description: 'We support young people to get into employment so they can support themselves and live independent lives. Help with getting a job would be invaluable.' },
  { type: 'time', organisation: 'Coffee4Craig', description: 'Test result.' },
  { type: 'time', organisation: 'Coffee4Craig', description: 'Another Test result.' }
]

var theList = new List('js-result', options, values)

console.log(theList)


/*
 Example need data

 {
"id": "56d9ba46a3b948fda0b49374",
"description": "Interview & job seeking skills",
"serviceProviderId": "lifeshare",
  "type": "People",
"reason": "We support young people to get into employment so they can support themselves and live independent lives. Help with getting a job would be invaluable.",
"moreInfoUrl": null,
"postcode": "M1 1EB",
"instructions": "No specific skills or qualifications required. Please contact us for more detail.",
"email": "viv@streetsupport.net",
"donationAmountInPounds": 0,
"donationUrl": null
},
*/
