if (window && window.angular) {
  module.exports = require('./angular/sync-ng');
} else {
  var q = require('q');
  module.exports = require('./syncService')(q);
}