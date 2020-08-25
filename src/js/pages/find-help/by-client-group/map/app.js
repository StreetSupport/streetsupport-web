import '../../../../common'

import ko from 'knockout'

import Model from '../../../../models/find-help/by-client-group/by-location'

const model = new Model()

ko.applyBindings(model)

window.initMap = () => { }
