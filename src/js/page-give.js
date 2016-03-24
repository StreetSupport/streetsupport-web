// Common modules
import './common'

// Page modules
var awesomplete = require('imports?this=>window!../../node_modules/awesomplete/awesomplete.js') // eslint-disable-line
import List from 'list.js'
// var ListFuzzySearch = require('imports?this=>window!../../node_modules/list.fuzzysearch.js/dist/list.fuzzysearch.js')
import Holder from 'holderjs'
import Bricks from 'bricks.js'

import templating from './template-render'

import Find from 'lodash/collection/find'

// Run Holder
Holder.run({})

// Example data
var data = [
  { id: '0', type: 'people', organisation: 'Mad Dogs', description: 'We support young people to get into employment so they can support themselves and live independent lives. Help with getting a job would be invaluable.' },
  { id: '1', type: 'time', organisation: 'Coffee4Craig', description: 'Test result.' },
  { id: '2', type: 'time', organisation: 'Coffee4Craig', description: 'Another Test result.' },
  { id: '3', type: 'people', organisation: 'Mad Dogs', description: 'We support young people to get into employment so they can support themselves and live independent lives. Help with getting a job would be invaluable.' },
  { id: '4', type: 'time', organisation: 'Coffee4Craig', description: 'Test result.' },
  { id: '5', type: 'time', organisation: 'Coffee4Craig', description: 'Another Test result.' },
  { id: '6', type: 'people', organisation: 'Mad Dogs', description: 'We support young people to get into employment so they can support themselves and live independent lives. Help with getting a job would be invaluable.' },
  { id: '7', type: 'time', organisation: 'Coffee4Craig', description: 'Test result.' },
  { id: '8', type: 'time', organisation: 'Coffee4Craig', description: 'Another Test result.' }
]

// List.js
var options = {
  valueNames: [ 'id', 'type', 'organisation', 'description' ],
  item: '<li><a href="#"><span class="id"></span><h3 class="h3 type"></h3><p class="organisation"></p><p class="description"></p></a></li>',
  plugins: [
    // ListFuzzySearch()
  ]
}

var theList = new List('js-card-search', options, data)

// Bricks.js
const sizes = [
  { columns: 1, gutter: 20 }, // assumed to be mobile, because of the missing mq property
  { mq: '360px', columns: 1, gutter: 20 },
  { mq: '480px', columns: 2, gutter: 20 },
  { mq: '600px', columns: 2, gutter: 20 },
  { mq: '800px', columns: 3, gutter: 20 }
]

const instance = Bricks({
  container: '.list',
  packed: 'data-packed', // if not prefixed with 'data-', it will be added
  sizes: sizes
})

// start it up, when the DOM is ready
// note that if images are in the grid, you may need to wait for document.readyState === 'complete'
document.addEventListener('DOMContentLoaded', event => {
  instance
    .resize(true) // bind resize handler
    .pack() // pack initial items
})

// Triggers
theList.on('sortStart', () =>
  instance.pack()
)

theList.on('searchComplete', () =>
  // alert('searched')
  instance.pack()
)

// Full detail view
var i
var items = document.querySelectorAll('.list li')

// Add click listener to each item
for (i = 0; i < items.length; i++) {
  items[i].addEventListener('click', function (event) {
    event.preventDefault()
    openCard(this)
  })
}

var openCard = function (el) {
  var theId = el.getElementsByClassName('id')[0].textContent
  var cardData = Find(data, function (o) { return o.id === theId })

  // hide search
  document.querySelector('#js-card-search').classList.remove('is-active')
  document.querySelector('#js-card-search').classList.add('is-hidden')

  // Append object name for Hogan
  var theTemplateData = { card: cardData }

  var callback = function () {
    document.querySelector('.js-card-detail').classList.remove('is-hidden')
    document.querySelector('.js-card-detail').classList.add('is-active')

    window.scrollTo(0, 0)
  }

  templating.renderTemplate('js-card-detail-tpl', theTemplateData, 'js-card-detail-output', callback)
}

// theList.fuzzySearch.search('craig')

// Example bricks.js api
/*
instance
  .on('pack', () => console.log('ALL grid items packed.'))
  .on('update', () => console.log('NEW grid items packed.'))
  .on('resize', size => console.log('The grid has be re-packed to accommodate a new BREAKPOINT.'))
*/

// Example filter code
/*
listObj.filter(function(item) {
   if (item.values().id > 1) {
       return true;
   } else {
       return false;
   }
}); // Only items with id > 1 are shown in list

listObj.filter(); // Remove all filters
*/

// Example need data
/*
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
