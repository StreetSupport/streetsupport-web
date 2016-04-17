// global
var resizeTimer
var $listToSelect

var init = function () {
  // bind events
  document.addEventListener('DOMContentLoaded', function () {
    $listToSelect = document.querySelectorAll('.list-to-dropdown')

    changeToSelect()
  })

  window.onresize = function () {
    clearTimeout(resizeTimer)

    resizeTimer = setTimeout(changeToSelect, 250)
  }
}

// utils
function isSmallscreen () {
  var width = window.innerWidth
  return width < 480
}

// module
var changeToSelect = function () {
  for (var i = 0; i < $listToSelect.length; ++i) {
    var $list = $listToSelect[i]

    var id = 'list-to-dropdown_' + i

    if (!document.getElementById(id) !== null) {
      $list.id = id
    }
  }

  if (isSmallscreen()) {
    var j
    for (j = 0; j < $listToSelect.length; ++j) {
      var $list = $listToSelect[j]

      createDropdown(j, $list)
    }
  }
}

function createDropdown (j, $list) {
  var id = 'list-to-dropdown__select_' + j

  if (document.getElementById(id) === null) {
    var $select = document.createElement('select')
    $select.id = id
    $select.classList.add('list-to-dropdown__select')

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
