var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var CONSTANTS = require('../../constants');

describe("Start Sync Mediator Topic", function() {
  var startSyncTopic = "wfm:sync:mockdatasetid:start";

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
      start: sinon.stub().resolves()
    };

    function checkMocks() {
      sinon.assert.calledOnce(mockDatasetManager.start);
    }

    beforeEach(function() {
      mockDatasetManager.start.reset();
      syncSubscribers.on(CONSTANTS.TOPICS.START, require('./start')(syncSubscribers, mockDatasetManager));
    });

    it("start", function() {
      return mediator.publish(startSyncTopic).then(checkMocks);
    });
  });

  describe("Error Case", function() {
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      start: sinon.stub().rejects(expectedTopicError)
    };

    function checkMocks(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.start);
    }

    beforeEach(function() {
      mockDatasetManager.start.reset();
      syncSubscribers.on(CONSTANTS.TOPICS.START, require('./start')(syncSubscribers, mockDatasetManager));
    });


    it("start", function() {
      return mediator.publish(startSyncTopic).catch(checkMocks);
    });



  });
});