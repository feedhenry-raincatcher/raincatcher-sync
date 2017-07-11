'use strict';

var defaultConfig = require('./config');
var q = require('q');
var _ = require('lodash');
var debug = require('./utils/logger')(__filename);
var CONSTANTS = require('./constants');
var buildQuery = require('./db/query');

var semver = require('semver');
var shortid = require('shortid');

/**
 * @param {*} store
 * store.db - mongoConnection
 * store.dataListHandler etc. override for custom data handling
 */
function initSync(mediator, mbaasApi, datasetId, syncOptions, store) {
  syncOptions = syncOptions || defaultConfig.syncOptions;
  debug('Sync init');
  //start the sync service
  var deferred = q.defer();

  //Checking the version of fh-mbaas-api passed.
  if (!semver.valid(mbaasApi.getVersion(), CONSTANTS.FH_MBAAS_API_VERSION_RANGE)) {
    deferred.reject(new Error("Invalid fh-mbaas-api version . Expected " + CONSTANTS.FH_MBAAS_API_VERSION_RANGE + " but got " + mbaasApi.getVersion()));
    return deferred.promise;
  }

  var dataListHandler = function(datasetId, queryParams, cb, metadata) {
    if (store.dataListHandler) {
      return store.dataListHandler(datasetId, queryParams, cb, metadata);
    }
    queryParams = queryParams || {};

    var query = buildQuery(queryParams.filter);
    var resultPromise = store.db.collection(datasetId).find(query);

    if (queryParams.sort && typeof queryParams.sort === 'object') {
      resultPromise = resultPromise.sort(queryParams.sort);
    }
    return resultPromise.toArray().then(function(list) {
      var syncData = {};
      list.forEach(function(object) {
        syncData[object.id] = object;
      });
      return cb(null, syncData);
    }).catch(function(err) {
      return cb(err);
    });
  };

  var dataCreateHandler = function(datasetId, data, cb, metadata) {
    if (store.dataCreateHandler) {
      return store.dataCreateHandler(datasetId, data, cb, metadata);
    }
    data.id = shortid.generate();
    store.db.collection(datasetId).insertOne(data).then(function() {
      var res = {
        "uid": data.id,
        "data": data
      };
      return cb(null, res);
    }).catch(function(err) {
      return cb(err);
    });
  };

  var dataSaveHandler = function(datasetId, uid, data, cb, metadata) {
    if (store.dataSaveHandler) {
      return store.dataSaveHandler(datasetId, uid, data, cb, metadata);
    }
    var query;
    if (!_.isObject(data)) {
      return cb("Expected an object to update");
    }
    if (data._id) {
      delete data._id;
    }
    if (data.id) {
      query = {id: data.id};
    } else if (data._localuid) {
      query = {_localuid: data._localuid};
    } else {
      return cb("Expected the object to have either an id or _localuid field");
    }
    return store.db.collection(datasetId).replaceOne(query, data).then(function() {
      return cb(null, data);
    }).catch(function(err) {
      return cb(err);
    });
  };

  var dataGetHandler = function(datasetId, uid, cb, metadata) {
    if (store.dataGetHandler) {
      return store.dataGetHandler(datasetId, uid, cb, metadata);
    }
    store.db.collection(datasetId).findOne({id: uid})
      .then(function(result) {
        if (!result) {
          return cb("Missing result");
        }
        return cb(null, result);
      }).catch(function(err) {
        return cb(err);
      });
  };

  var dataDeleteHandler = function(datasetId, uid, cb, metadata) {
    if (store.dataDeleteHandler) {
      return store.dataDeleteHandler(datasetId, uid, cb, metadata);
    }
    store.db.collection(datasetId).deleteOne({id: uid}).then(function(object) {
      return cb(null, object);
    }).catch(function(err) {
      return cb(err);
    });
  };

  var collisionHandler = syncOptions.dataCollisionHandler;

  mbaasApi.sync.init(datasetId, syncOptions, function(err) {
    if (err) {
      debug('Sync error: init:', datasetId, err);
      deferred.reject(err);
    } else {
      mbaasApi.sync.handleList(datasetId, dataListHandler);
      mbaasApi.sync.handleCreate(datasetId, dataCreateHandler);
      mbaasApi.sync.handleUpdate(datasetId, dataSaveHandler);
      mbaasApi.sync.handleRead(datasetId, dataGetHandler);
      mbaasApi.sync.handleDelete(datasetId, dataDeleteHandler);

      // set optional custom collision handler if its a function
      if (_.isFunction(collisionHandler)) {
        mbaasApi.sync.handleCollision(datasetId, collisionHandler);
      }

      //Set optional custom hash function to deal with detecting model changes.
      if (_.isFunction(syncOptions.hashFunction)) {
        //mbaasApi.sync.setRecordHashFn(datasetId, syncOptions.hashFunction);
        mbaasApi.sync.handleHash(datasetId, syncOptions.hashFunction);
      }

      deferred.resolve(datasetId);
    }
  });
  return deferred.promise;
}

function stop(mbaasApi, datasetId) {
  var deferred = q.defer();
  mbaasApi.sync.stop(datasetId, function() {
    deferred.resolve(datasetId);
  });
  return deferred.promise;
}

module.exports = {
  init: initSync,
  stop: stop
};
