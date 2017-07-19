'use strict';

var defaultConfig = require('./config');
var q = require('q');
var _ = require('lodash');
var debug = require('./utils/logger')(__filename);
var CONSTANTS = require('./constants');

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


  var dataListHandler = function(datasetId, queryParams, metadata, cb) {
    if (store.dataListHandler) {
      return store.dataListHandler(datasetId, queryParams, metadata, cb);
    }
    var startTime = new Date();//debug
    return store.db.collection(datasetId).find(queryParams).toArray(function(err, list) {
      var timeDiff = new Date() - startTime;//debug
      if (err) {
        console.log('Sync '+datasetId+' dataListHandler ERROR took ' + timeDiff + ' milliseconds, for: '+queryParams+' and err: '+err);   //debug
        return cb(err);
      }
      var syncData = {};
      list.forEach(function (object) {
        if (object._id) {
          delete object._id;
        }
        syncData[object.id] = object;
      });
      console.log('Sync '+datasetId+' dataListHandler DONE took ' + timeDiff + ' milliseconds, for: '+queryParams);   //debug
      return cb(null, syncData);
    })
  };


  var dataCreateHandler = function(datasetId, data, metadata, cb) {
    if (store.dataCreateHandler) {
      return store.dataCreateHandler(datasetId, data, metadata, cb);
    }
    var startTime = new Date();//debug
    var uid = shortid.generate();
    data.id = uid;
    store.db.collection(datasetId).insertOne(data, function(err, res) {
      var timeDiff = new Date() - startTime;//debug
      if (err) {
        console.log('Sync '+datasetId+' dataCreateHandler ERROR took ' + timeDiff + ' milliseconds, for: '+data+' and err: '+err);   //debug
        return cb(err);
      }
      delete res.ops[0]._id;
      var data = {
        uid: uid,
        data: res.ops[0]
      };
      console.log('Sync '+datasetId+' dataCreateHandler DONE took ' + timeDiff + ' milliseconds, for: '+data);   //debug
      cb(null, data);
    });
  };

  var dataSaveHandler = function(datasetId, uid, data, metadata, cb) {
    if (store.dataSaveHandler) {
      return store.dataSaveHandler(datasetId, uid, data, metadata, cb);
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
    var startTime = new Date();//debug
    return store.db.collection(datasetId).replaceOne(query, data).then(function() {
      var timeDiff = new Date() - startTime;//debug
      console.log('Sync '+datasetId+' dataSaveHandler DONE took ' + timeDiff + ' milliseconds, for: '+data);   //debug
      return cb(null, data);
    }).catch(function(err) {
      var timeDiff = new Date() - startTime;//debug
      console.log('Sync '+datasetId+' dataSaveHandler ERROR took ' + timeDiff + ' milliseconds, for: '+data+' and err: '+err);   //debug
      return cb(err);
    });
  };

  var dataGetHandler = function(datasetId, uid, metadata, cb) {
    if (store.dataGetHandler) {
      return store.dataGetHandler(datasetId, uid, metadata, cb);
    }
    var startTime = new Date();//debug
    store.db.collection(datasetId).findOne({id: uid}, function(err, found) {
      var timeDiff = new Date() - startTime;//debug
      if (err) {
        console.log('Sync '+datasetId+' dataGetHandler ERROR took ' + timeDiff + ' milliseconds, for uid: '+uid+' and err: '+err);   //debug
        return cb(err);
      }
      if (found) {
        delete found._id; //do not return _id field as part of the object
      }
      console.log('Sync '+datasetId+' dataGetHandler DONE took ' + timeDiff + ' milliseconds, for uid: '+uid);   //debug
      return cb(null, found);
    });
  };

  var dataDeleteHandler = function(datasetId, uid, metadata, cb) {
    if (store.dataDeleteHandler) {
      return store.dataDeleteHandler(datasetId, uid, metadata, cb);
    }
    var startTime = new Date();//debug
    store.db.collection(datasetId).deleteOne({id: uid}).then(function(object) {
      var timeDiff = new Date() - startTime;//debug
      if (object._id) {
        delete object._id;
      }
      console.log('Sync '+datasetId+' dataDeleteHandler DONE took ' + timeDiff + ' milliseconds, for uid: '+uid);   //debug
      return cb(null, object);
    }).catch(function(err) {
      var timeDiff = new Date() - startTime;//debug
      console.log('Sync '+datasetId+' dataDeleteHandler ERROR took ' + timeDiff + ' milliseconds, for uid: '+uid+' and err: '+err);   //debug
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
        mbaasApi.sync.setRecordHashFn(datasetId, syncOptions.hashFunction);
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
