import ko from 'knockout'
import { getServicesByDay } from '../../pages/find-help/provider-listing/helpers'
import FindHelp from './FindHelp'

require('../../arrayExtensions')

const ajax = require('../../get-api-data')
const browser = require('../../browser')
const endpoints = require('../../api')
const querystring = require('../../get-url-parameter')

export default class FindHelpByDay extends FindHelp {
  constructor () {
    super([{ qsKey: 'day', getValue: () => this.dayOfWeek() }])
    const postcodeInQuerystring = querystring.parameter('postcode')

    this.isLoaded = false
    this.day = ko.observable(0)
    this.allOriginalItems = ko.observableArray([])

    this.timesOfDay = [
      { id: 'Morning', startTime: '06:00', endTime: '12:00' },
      { id: 'Afternoon', startTime: '12:00', endTime: '17:30' },
      { id: 'Evening', startTime: '17:30', endTime: '24:00' }
    ]
    this.timeOfDay = ko.observable()
    this.timeOfDay.subscribe((newTimeOfDay) => {
      this.setTimeOfDay(newTimeOfDay)
    })

    this.daysOfWeek = ko.observableArray([])
    this.dayOfWeek = ko.observable()
    this.dayOfWeek.subscribe((selectedDay) => {
      this.daySetActive(this.items().find((d) => d.name === selectedDay))
      if (this.getDayOfWeekValue(selectedDay) !== this.day()) {
        this.onProximitySearch()
      }
    })

    if (postcodeInQuerystring) {
      this.proximitySearch.postcode(postcodeInQuerystring)
      this.proximitySearch.search()
    }

    if (this.proximitySearch.hasCoords() && !this.isLoaded) {
      this.onProximitySearch()
    }

    browser.setOnHistoryPop((e) => {
      this.onBrowserHistoryBack(this, e)
    })
  }

  setTimeOfDay (newTimeOfDay) {
    const selectedTimeOfDay = this.timesOfDay.find((t) => t.id === newTimeOfDay)
    const insideOfSelectedTimePeriod = (openingTime) => (
      (openingTime.startTime < selectedTimeOfDay.startTime &&
        openingTime.endTime > selectedTimeOfDay.startTime) ||
      (openingTime.startTime > selectedTimeOfDay.startTime &&
        openingTime.startTime < selectedTimeOfDay.endTime)
    )
    this.items()
      .forEach((day) => {
        day.serviceProviders.forEach((sp) => {
          sp.isNotVisible(selectedTimeOfDay !== undefined && !insideOfSelectedTimePeriod(sp.openingTime))
        })
      })
  }

  daySetActive (activeDay) {
    if (!activeDay.isSelected()) {
      activeDay.isSelected(true)
    }
    this.pushHistory()
  }

  onProximitySearch () {
    this.isLoaded = true
    const dayOfWeekqs = querystring.parameter('day')
    if (!dayOfWeekqs) {
      this.pushHistory()
      this.day(new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)
    } else {
      this.day(this.getDayOfWeekValue(dayOfWeekqs))
    }

    browser.loading()
    const url = `${endpoints.categoryServiceProvidersByDay}${this.category.categoryId}/long/${this.proximitySearch.longitude}/lat/${this.proximitySearch.latitude}?range=${this.proximitySearch.range()}&day=${this.day()}`
    ajax
      .data(url)
      .then((result) => {
        const parsedData = getServicesByDay(result.data.daysServices)
        this.items([])
        this.items(parsedData)
        this.daysOfWeek(this.items().map((d) => { return { id: d.name } }))

        this.items()
          .forEach((d) => {
            d.isSelected.subscribe((isNowSelected) => {
              if (isNowSelected) {
                this.items()
                  .filter((otherDay) => otherDay.name !== d.name)
                  .forEach((otherDay) => {
                    otherDay.isSelected(false)
                  })
                this.dayOfWeek(d.name)
                this.pushHistory()
              }
            })
          })
        if (dayOfWeekqs) {
          this.items()
            .find((d) => d.name === dayOfWeekqs)
            .isSelected(true)
        } else {
          this.items()[0].isSelected(true)
        }

        if (this.timeOfDay()) {
          this.setTimeOfDay(this.timeOfDay())
        }
        browser.loaded()
      })
  }

  onBrowserHistoryBack (thisDoobrey, e) {
    if (e.state && e.state.postcode !== thisDoobrey.proximitySearch.postcode()) {
      thisDoobrey.proximitySearch.postcode(e.state.postcode)
      thisDoobrey.proximitySearch.search()
    }
  }

  pushHistory () {
    const postcodeqs = querystring.parameter('postcode')
    const dayOfWeekqs = querystring.parameter('day')

    const postcode = this.proximitySearch.postcode()
    const day = this.dayOfWeek()

    if (postcode !== postcodeqs || day !== dayOfWeekqs) {
      const kvps = [
        { key: 'postcode', value: postcode },
        { key: 'day', value: day }
      ]
        .filter((kv) => kv.value !== undefined)

      const qs = kvps
        .map((kv) => `${kv.key}=${kv.value}`)
        .join('&')

      const history = {}
      kvps
        .forEach((kvp) => {
          history[kvp.key] = kvp.value
        })

      const newUrl = `?${qs}`
      browser.pushHistory(history, '', newUrl)
    }
  }

  getDayOfWeekValue (day) {
    switch (day) {
      case 'Monday':
        return 0
      case 'Tuesday':
        return 1
      case 'Wednesday':
        return 2
      case 'Thursday':
        return 3
      case 'Friday':
        return 4
      case 'Saturday':
        return 5
      case 'Sunday':
        return 6
      default:
        return 0
    }
  }
}
