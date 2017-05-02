// Common modules
import '../../../common'

// Page modules
var ko = require('knockout')
var Model = require('../../../models/accommodation/listing')

ko.applyBindings(new Model())
