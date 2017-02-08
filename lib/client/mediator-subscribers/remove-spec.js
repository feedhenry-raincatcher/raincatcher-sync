var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var _ = require('lodash');
var q = require('q');
var shortid = require('shortid');

describe("Sync Remove Mediator Topic", function() {
  var getRemoveTopicSubscriber = require('./remove');
  var readTopic = "wfm:sync:remove:mockdatasetid";

  var mockDataItem = {
    id: "mockdataitemid",
    name: "This is a mock data item"
  };

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.removeSubscriber = getRemoveTopicSubscriber(mediator, mockDataManager);
    };
  });

  //Removing the subscribers when finished a test.
  afterEach(function() {
    mediator.remove(this.topic, this.removeSubscriber.id);

    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });

  describe("No Error", function() {
    var doneTopic = "done:wfm:sync:remove:mockdatasetid";

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      delete: sinon.stub().resolves()
    };

    function checkMocks() {

      sinon.assert.calledOnce(mockDatasetManager.delete);
      sinon.assert.calledWith(mockDatasetManager.delete, sinon.match({id: mockDataItem.id}));
    }


    beforeEach(function() {
      mockDatasetManager.delete.reset();
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
    var errorTopic = "error:wfm:sync:remove:mockdatasetid";

    function checkMocks() {
      sinon.assert.calledOnce(mockDatasetManager.delete);
      sinon.assert.calledWith(mockDatasetManager.delete, sinon.match({id: mockDataItem.id}));
    }

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      delete: sinon.stub().rejects(expectedTopicError)
    };

    beforeEach(function() {
      mockDatasetManager.delete.reset();
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