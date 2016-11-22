'use strict';

module.exports = 'wfm.sync.service';

angular.module('wfm.sync.service', [])
.factory('syncService', function($q) {
  return require('../syncService', $q);
});
