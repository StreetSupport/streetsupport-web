// Common modules
import '../../common'

// Page modules
var ko = require('knockout')
var Model = require('../../models/all-organisations/listing')

ko.applyBindings(new Model(null, 1000))
