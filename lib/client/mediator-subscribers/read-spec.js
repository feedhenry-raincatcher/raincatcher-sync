var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var expect = chai.expect;
var shortid = require('shortid');

describe("Sync Read Mediator Topic", function() {
  var getReadTopicSubscriber = require('./read');
  var readTopic = "wfm:sync:read:mockdatasetid";

  var mockDataItem = {
    id: "mockdataitemid",
    name: "This is a mock data item"
  };

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.readSubscriber = getReadTopicSubscriber(mediator, mockDataManager);
    };
  });

  //Removing the subscribers when finished a test.
  afterEach(function() {
    mediator.remove(this.topic, this.readSubscriber.id);

    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });

  describe("No Error", function() {
    var doneTopic = "done:wfm:sync:read:mockdatasetid";

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      read: sinon.stub().resolves(mockDataItem)
    };

    function checkMocks(readResult) {
      expect(readResult).to.deep.equal(mockDataItem);

      sinon.assert.calledOnce(mockDatasetManager.read);
      sinon.assert.calledWith(mockDatasetManager.read, sinon.match(mockDataItem.id));
    }


    beforeEach(function() {
      mockDatasetManager.read.reset();
      this.createMocks(mockDatasetManager, readTopic);
    });

    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();

      this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

      mediator.publish(readTopic, {
        id: mockDataItem.id
      });

      return testDeferred.promise.then(checkMocks);
    });

    it("should handle a unique topic id", function() {
      var testDeferred = q.defer();

      var topicUid = shortid.generate();
      var expectedDoneTopic = doneTopic + ":" + topicUid;

      this.subscribers[doneTopic] = mediator.subscribe(expectedDoneTopic, testDeferred.resolve);

      mediator.publish(readTopic, {
        id: mockDataItem.id,
        topicUid: topicUid
      });

      return testDeferred.promise.then(checkMocks);
    });

  });


  describe("Error", function() {
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");
    var errorTopic = "error:wfm:sync:read:mockdatasetid";

    function checkMocks(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.read);
      sinon.assert.calledWith(mockDatasetManager.read, sinon.match(mockDataItem.id));
    }

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      read: sinon.stub().rejects(expectedTopicError)
    };

    beforeEach(function() {
      mockDatasetManager.read.reset();
      this.createMocks(mockDatasetManager, readTopic);
    });

    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();

      this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

      mediator.publish(readTopic, {
        id: mockDataItem.id
      });

      return testDeferred.promise.then(checkMocks);
    });

    it("should handle a unique topic id", function() {
      var testDeferred = q.defer();

      var topicUid = shortid.generate();
      var expectedErrorTopic = errorTopic + ":" + topicUid;

      this.subscribers[errorTopic] = mediator.subscribe(expectedErrorTopic, testDeferred.resolve);

      mediator.publish(readTopic, {
        id: mockDataItem.id,
        topicUid: topicUid
      });

      return testDeferred.promise.then(checkMocks);
    });

  });


});