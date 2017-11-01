const tasksPath = require('path').join(__dirname, '.');

require('fs').readdirSync(tasksPath).forEach(function(file) {
  require('./' + file);
});
