var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var shortid = require('shortid');
var expect = chai.expect;

describe("Sync Force Sync Mediator Topic", function() {
  var getForceSyncSubscriber = require('./force-sync');
  var forceSyncTopic = "wfm:sync:force_sync:mockdatasetid";

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.updateSubscriber = getForceSyncSubscriber(mediator, mockDataManager);
    };
  });

  //Removing the subscribers when finished a test.
  afterEach(function() {
    mediator.remove(this.topic, this.updateSubscriber.id);

    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });


  describe("No Error", function() {
    var doneTopic = "done:wfm:sync:force_sync:mockdatasetid";
    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      forceSync: sinon.stub().resolves()
    };

    function checkMocks() {
      sinon.assert.calledOnce(mockDatasetManager.forceSync);
    }

    beforeEach(function() {
      mockDatasetManager.forceSync.reset();
      this.createMocks(mockDatasetManager, forceSyncTopic);
    });

    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();

      this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

      mediator.publish(forceSyncTopic);

      return testDeferred.promise.then(checkMocks);
    });

    it("should handle a unique topic id", function() {
      var testDeferred = q.defer();

      var topicUid = shortid.generate();
      var expectedTopic = doneTopic + ":" + topicUid;

      this.subscribers[doneTopic] = mediator.subscribe(expectedTopic, testDeferred.resolve);

      mediator.publish(forceSyncTopic, {
        topicUid: topicUid
      });

      return testDeferred.promise.then(checkMocks);
    });
  });

  describe("Error Case", function() {
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");
    var errorTopic = "error:wfm:sync:force_sync:mockdatasetid";

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      forceSync: sinon.stub().rejects(expectedTopicError)
    };

    function checkMocks(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.forceSync);
    }

    beforeEach(function() {
      mockDatasetManager.forceSync.reset();
      this.createMocks(mockDatasetManager, forceSyncTopic);
    });


    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();

      this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

      mediator.publish(forceSyncTopic);

      return testDeferred.promise.then(checkMocks);
    });

    it("should handle a unique topic id", function() {
      var testDeferred = q.defer();

      var topicUid = shortid.generate();

      var expectedErrorTopic = errorTopic + ":" + topicUid;

      this.subscribers[errorTopic] = mediator.subscribe(expectedErrorTopic, testDeferred.resolve);

      mediator.publish(forceSyncTopic, {
        topicUid: topicUid
      });

      return testDeferred.promise.then(checkMocks);
    });

  });
});