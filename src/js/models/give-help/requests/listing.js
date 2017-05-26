import List from 'list.js'
const Awesomplete = require('awesomplete')

const activeClass = 'is-active'

const initList = () => {
   // List.js
  const options = {
    valueNames: [ 'type', 'serviceProviderName', 'creationDate', 'description', 'keywords', 'distanceAwayInMetres' ],
    plugins: []
  }

  const theList = new List('js-card-search', options)
  theList.sort('creationDate', { order: 'desc' })

  return theList
}

let initFiltering = (theList) => {
  let runFiltering = () => {
    if (activeFilters.length === 0) {
      resetFiltering()
      return
    }

    theList.filter((item) => {
      if (activeFilters.length > 0) {
        return (activeFilters.indexOf(item.values().type)) > -1
      }
      return true
    })
  }

  let resetFiltering = () => {
    // Reset active states
    let c
    let filters = document.querySelectorAll('.js-filter-item')

    activeFilters = []

    for (c = 0; c < filters.length; c++) {
      filters[c].classList.remove(activeClass)
    }

    document.querySelector('.js-filter-item-all').classList.add(activeClass)

    // Reset filter & layout
    theList.filter()
  }

  let filters = Array.from(document.querySelectorAll('.js-filter-item'))
  let activeFilters = []

  // Add click listener to each item
  for (let b = 0; b < filters.length; b++) {
    filters[b].addEventListener('click', (event) => {
      let self = event.target
      let getFilter = self.getAttribute('data-filter')
      event.preventDefault()

      if (getFilter === 'all') {
        resetFiltering()
      } else {
        document.querySelector('.js-filter-item-all').classList.remove(activeClass)
        filters.forEach((f) => f.classList.remove(activeClass))
        self.classList.add(activeClass)
        activeFilters = [getFilter]
        runFiltering()
      }
    })
  }

  // Add change listener to `<select>` for small screens
  let filterList = document.querySelectorAll('.js-filter-list.list-to-dropdown__select')
  for (let c = 0; c < filterList.length; c++) {
    filterList[c].addEventListener('change', () => {
    })
  }
}

const initSorting = (theList) => {
  const sortCriteriaButtons = Array.from(document.querySelectorAll('.js-sort-criteria'))
  sortCriteriaButtons.forEach((b) => {
    b.addEventListener('click', (event) => {
      let sortFields = []
      sortFields['organisation'] = 'serviceProviderName'
      sortFields['date'] = 'creationDate'
      sortFields['distance'] = 'distanceAwayInMetres'

      let selectedSort = event.target.getAttribute('data-sort')
      let [field, direction] = selectedSort.split('-')
      theList.sort(sortFields[field], { order: direction })

      sortCriteriaButtons.forEach((cb) => {
        cb.classList.remove(activeClass)
      })
      event.target.classList.add(activeClass)
    })
  })
}

export const buildList = () => {
  const theList = initList()

  initFiltering(theList)
  initSorting(theList)
}

export const initAutoComplete = (needs) => {
  const keywords = needs
    .reduce((acc, n) => { return [...acc, ...n.keywords] }, [])
    .map((k) => k.toLowerCase())
    .filter((k) => k.length > 0)

  const unique = [...new Set(keywords)]
    .join(',')

  const input = document.querySelector('.search')
  new Awesomplete(input, {list: unique}) // eslint-disable-line
}
