var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var expect = chai.expect;
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var CONSTANTS = require('../../constants');

describe("Sync Force Sync Mediator Topic", function() {
  var forceSyncTopic = "wfm:sync:mockdatasetid:force_sync";

  var mockDatasetId = "mockdatasetid";

  var syncSubscribers = new MediatorTopicUtility(mediator);
  syncSubscribers.prefix(CONSTANTS.SYNC_TOPIC_PREFIX).entity(mockDatasetId);

  beforeEach(function() {
    this.subscribers = {};
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    syncSubscribers.unsubscribeAll();
  });


  it("No Error", function() {
    var mockDatasetManager = {
      datasetId: mockDatasetId,
      forceSync: sinon.stub().resolves()
    };

    function checkMocks() {
      sinon.assert.calledOnce(mockDatasetManager.forceSync);
    }

    beforeEach(function() {
      mockDatasetManager.forceSync.reset();
      syncSubscribers.on(CONSTANTS.SYNC_TOPICS.FORCE_SYNC, require('./force-sync')(syncSubscribers, mockDatasetManager));
    });

    it("should handle no unique topic id", function() {
      return mediator.publish(forceSyncTopic).then(checkMocks);
    });

  });

  describe("Error Case", function() {
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");
    var errorTopic = "error:wfm:sync:mockdatasetid:force_sync";

    var mockDatasetManager = {
      datasetId: mockDatasetId,
      forceSync: sinon.stub().rejects(expectedTopicError)
    };

    function checkMocks(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.forceSync);
    }

    beforeEach(function() {
      mockDatasetManager.forceSync.reset();
      syncSubscribers.on(CONSTANTS.TOPICS.FORCE_SYNC, require('./force-sync')(syncSubscribers, mockDatasetManager));
    });


    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();

      this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

      return  mediator.publish(forceSyncTopic).catch(checkMocks);
    });



  });
});