var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var CONSTANTS = require('../../constants');

describe("Stop Sync Mediator Topic", function() {
  var stopSyncTopic = "wfm:sync:mockdatasetid:stop";

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


  describe("No Error", function() {
    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      stop: sinon.stub().resolves()
    };

    function checkMocks() {
      sinon.assert.calledOnce(mockDatasetManager.stop);
    }

    beforeEach(function() {
      mockDatasetManager.stop.reset();
      syncSubscribers.on(CONSTANTS.TOPICS.STOP, require('./stop')(syncSubscribers, mockDatasetManager));
    });

    it("stop", function() {
      return mediator.publish(stopSyncTopic).then(checkMocks);
    });
  });

  describe("Error Case", function() {
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      stop: sinon.stub().rejects(expectedTopicError)
    };

    function checkMocks(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.stop);
    }

    beforeEach(function() {
      mockDatasetManager.stop.reset();
      syncSubscribers.on(CONSTANTS.TOPICS.STOP, require('./stop')(syncSubscribers, mockDatasetManager));
    });


    it("stop", function() {
      return mediator.publish(stopSyncTopic).catch(checkMocks);
    });



  });
});