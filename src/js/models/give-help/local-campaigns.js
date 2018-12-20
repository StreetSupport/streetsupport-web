import locations from '../../location/supportedCities'
import { getSelectedLocationId } from '../../location/locationSelector'

export default class LocalCampaigns {
  constructor () {
    const currentLocationId = getSelectedLocationId()
    const location = locations.get(currentLocationId)

    this.hasCampaigns = false

    const campaigns = ['bigChangeIsEnabled', 'abenIsEnabled', 'realChangeIsEnabled']

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
      this.isWiganRealChangeTemplate = location.key === 'wigan-and-leigh'
      this.isBournemouthTemplate = location.key === 'bournemouth'
      this.isDefaultTemplate = location.key === 'leeds'

      campaigns
        .forEach((c) => {
          this[c] = location[c]
        })
    }
  }
}
