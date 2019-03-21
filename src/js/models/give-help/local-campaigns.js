import locations from '../../location/supportedCities'
import { getSelectedLocationId } from '../../location/locationSelector'

export default class LocalCampaigns {
  constructor () {
    const currentLocationId = getSelectedLocationId()
    const location = locations.get(currentLocationId)

    this.hasCampaigns = false

    const campaigns = ['bigChangeIsEnabled', 'abenIsEnabled', 'realChangeIsEnabled']

    const locationCampaigns = [
      { key: 'isWiganRealChangeTemplate', locationKey: 'wigan-and-leigh' },
      { key: 'isRochdaleRealChangeTemplate', locationKey: 'rochdale' },
      { key: 'isBournemouthTemplate', locationKey: 'bournemouth' },
      { key: 'isDefaultTemplate', locationKey: 'leeds' },
      { key: 'isManchester', locationKey: 'manchester' }
    ]

    if (location) {
      this.hasCampaigns = campaigns
        .reduce((acc, next) => {
          return acc
            ? true
            : location[next]
        }, false)
      this.locationName = location.name
      this.realChangeUrl = location.realChangeUrl
      this.realChangeTitle = location.realChangeTitle
      locationCampaigns
        .forEach((c) => {
          this[c.key] = location.key === c.locationKey
        })

      campaigns
        .forEach((c) => {
          this[c] = location[c]
        })
    }
  }
}
