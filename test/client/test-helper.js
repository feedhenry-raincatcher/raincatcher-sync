'use strict';

var _ = require('lodash');
var q = require('q');
var navigatorOnLine, navigatorOffLine, oldNavigator;

exports.startLoggingNotifications = function(stream) {
  var subscription = stream.subscribe(function(event) {
    console.log('\x1b[36m%s\x1b[0m', '** sync event:', event.dataset_id, ':', event.code, ':',  event.message);
  });
  return subscription;
};

exports.stopLoggingNotifications = function(subscription) {
  subscription.unsubscribe;
};

exports.syncServerReset = function($fh, datasetId) {
  var deferred = q.defer();
  $fh.cloud({
    path: '/sync/reset/' + datasetId,
    method: 'GET'
  }, function() {
    deferred.resolve();
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
};

exports.syncServerInit = function($fh, datasetId) {
  var deferred = q.defer();
  $fh.cloud({
    path: '/sync/init/' + datasetId,
    method: 'GET'
  }, function() {
    deferred.resolve();
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
};

exports.syncServerStop = function($fh, datasetId) {
  var deferred = q.defer();
  $fh.cloud({
    path: '/sync/stop/' + datasetId,
    method: 'GET'
  }, function() {
    deferred.resolve();
  }, function(err) {
    deferred.reject(err);
  });
  return deferred.promise;
};

exports.overrideNavigator = function() {
  // Overide window.navigator.onLine to make sync work
  if (! oldNavigator) {
    navigatorOnLine = _.clone(navigator);
    navigatorOffLine = _.clone(navigator);
    navigatorOnLine.onLine = true;
    navigatorOffLine.onLine = false;
    oldNavigator = navigator;
    navigator = navigatorOnLine;
  }
};

exports.restoreNavigator = function() {
  if (navigator.oldNavigator) {
    navigator = navigator.oldNavigator;
  }
};

exports.setOnline = function(onLine) {
  navigator = onLine ? navigatorOnLine : navigatorOffLine;
};

exports.notificationPromise = function(stream, condition) {
  return stream.filter(function(notification) {
    return _.isMatch(notification, condition);
  }).take(1).toPromise(q.Promise);
};
