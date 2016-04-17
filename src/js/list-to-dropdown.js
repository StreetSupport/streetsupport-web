/**
* @file list to dropdown - generic convert list to `<select>`
* @author Daniel Furze <daniel@furzeface.com>
* @see `./utils.js`
*/

import utils from './utils'

/**
* @namespace listToDropdown
*/

var resizeTimer
var $listToSelect

/**
* @function init
* @memberOf listToDropdown
*/
var init = function () {
  // bind events
  document.addEventListener('DOMContentLoaded', function () {
    $listToSelect = document.querySelectorAll('.list-to-dropdown')

    convertToDropdown()
  })

  // debouncing, sort of
  window.onresize = function () {
    clearTimeout(resizeTimer)

    resizeTimer = setTimeout(convertToDropdown, 250)
  }
}

/**
* @function convertToDropdown
* @memberOf listToDropdown
*/
var convertToDropdown = function () {
  for (var i = 0; i < $listToSelect.length; ++i) {
    var $list = $listToSelect[i]

    var id = 'list-to-dropdown_' + i

    if (!document.getElementById(id) !== null) {
      $list.id = id
    }
  }

  if (utils.isSmallscreen()) {
    var j
    for (j = 0; j < $listToSelect.length; ++j) {
      var $list = $listToSelect[j]

      createDropdown(j, $list)
    }
  }
}

/**
* @function createDropdown
* @memberOf listToDropdown
* @param  {Number} j     - counter to increment
* @param  {Obj}    $list - DOM obj
*/
function createDropdown (j, $list) {
  var id = 'list-to-dropdown__select_' + j

  if (document.getElementById(id) === null) {
    var $select = document.createElement('select')
    $select.id = id
    $select.classList.add('list-to-dropdown__select')

    var cssClasses = $list.classList
    cssClasses.forEach(function (cssClass) {
      if (cssClass !== 'list-to-dropdown') {
        $select.classList.add(cssClass)
      }
    })

    var $parent = $list.parentNode
    $parent.insertBefore($select, $list)

    var $listItems = $list.children
    for (var k = 0; k < $listItems.length; ++k) {
      var text = $listItems[k].innerText
      var $option = document.createElement('option')
      $option.innerText = text
      $option.value = text
      $select.appendChild($option)
    }
  }
}

module.exports = {
  init: init
}
