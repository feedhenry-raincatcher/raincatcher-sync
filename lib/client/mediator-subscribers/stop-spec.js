var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var shortid = require('shortid');
var expect = chai.expect;

describe("Stop Sync Mediator Topic", function() {
  var getStopSyncSubscriber = require('./stop');
  var stopSyncTopic = "wfm:sync:stop:mockdatasetid";

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.stopSubscriber = getStopSyncSubscriber(mediator, mockDataManager);
    };
  });

  //Removing the subscribers when finished a test.
  afterEach(function() {
    mediator.remove(this.topic, this.stopSubscriber.id);

    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });


  describe("No Error", function() {
    var doneTopic = "done:wfm:sync:stop:mockdatasetid";
    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      stop: sinon.stub().resolves()
    };

    function checkMocks() {
      sinon.assert.calledOnce(mockDatasetManager.stop);
    }

    beforeEach(function() {
      mockDatasetManager.stop.reset();
      this.createMocks(mockDatasetManager, stopSyncTopic);
    });

    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();

      this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

      mediator.publish(stopSyncTopic);

      return testDeferred.promise.then(checkMocks);
    });

    it("should handle a unique topic id", function() {
      var testDeferred = q.defer();

      var topicUid = shortid.generate();
      var expectedTopic = doneTopic + ":" + topicUid;

      this.subscribers[doneTopic] = mediator.subscribe(expectedTopic, testDeferred.resolve);

      mediator.publish(stopSyncTopic, {
        topicUid: topicUid
      });

      return testDeferred.promise.then(checkMocks);
    });
  });

  describe("Error Case", function() {
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");
    var errorTopic = "error:wfm:sync:stop:mockdatasetid";

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
      this.createMocks(mockDatasetManager, stopSyncTopic);
    });


    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();

      this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

      mediator.publish(stopSyncTopic);

      return testDeferred.promise.then(checkMocks);
    });

    it("should handle a unique topic id", function() {
      var testDeferred = q.defer();

      var topicUid = shortid.generate();

      var expectedErrorTopic = errorTopic + ":" + topicUid;

      this.subscribers[errorTopic] = mediator.subscribe(expectedErrorTopic, testDeferred.resolve);

      mediator.publish(stopSyncTopic, {
        topicUid: topicUid
      });

      return testDeferred.promise.then(checkMocks);
    });

  });
});