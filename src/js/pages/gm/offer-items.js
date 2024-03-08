import '../../common'

const marked = require('marked')
marked.setOptions({ sanitize: true })

const ko = require('knockout')

const OfferItemsForm = require('../../models/give-help/offer-items/OfferItemsModel')

const offerItemsForm = new OfferItemsForm()

ko.applyBindings({
  offerItemsForm
})
