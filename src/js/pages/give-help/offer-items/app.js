import '../../../common'

const ko = require('knockout')

const locationSelector = require('../../../location/locationSelector')
const OrgRetrieval = require('../../../models/all-organisations/listing')
const OfferItemsMap = require('../../../models/give-help/offer-items/OfferItemsMap')
const OfferItemsForm = require('../../../models/give-help/offer-items/OfferItemsModel')

const orgRetrieval = new OrgRetrieval()
const offerItemsMap = new OfferItemsMap()
const offerItemsForm = new OfferItemsForm()

ko.applyBindings({
  orgRetrieval,
  offerItemsMap,
  offerItemsForm
})

orgRetrieval.organisations.subscribe((newValue) => {
  locationSelector
    .getPreviouslySetPostcode()
    .then((result) => {
      offerItemsMap.providers(newValue.filter((o) => o.needCategories.length > 0))
      offerItemsMap.displayMap(result)
    })
})
