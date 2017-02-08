var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var shortid = require('shortid');
var expect = chai.expect;

describe("Sync List Mediator Topic", function() {
  var getListTopicSubscriber = require('./list');
  var listTopic = "wfm:sync:list:mockdatasetid";
  var mockDataItem = {
    id: "mockdataitemid",
    name: "This is a mock data item"
  };

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.updateSubscriber = getListTopicSubscriber(mediator, mockDataManager);
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

    var doneTopic = "done:wfm:sync:list:mockdatasetid";
    var arrayOfDataItems = [mockDataItem];

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      list: sinon.stub().resolves(arrayOfDataItems)
    };

    function checkMocks(listResult) {
      expect(listResult).to.deep.equal(arrayOfDataItems);

      sinon.assert.calledOnce(mockDatasetManager.list);
    }

    beforeEach(function() {
      mockDatasetManager.list.reset();
      this.createMocks(mockDatasetManager, listTopic);
    });

    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();

      this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

      mediator.publish(listTopic);

      return testDeferred.promise.then(checkMocks);
    });

    it("should handle a unique topic id", function() {
      var testDeferred = q.defer();

      var topicUid = shortid.generate();

      var expectedDoneTopic = doneTopic + ":" + topicUid;

      this.subscribers[doneTopic] = mediator.subscribe(expectedDoneTopic, testDeferred.resolve);

      mediator.publish(listTopic, {
        topicUid: topicUid
      });

      return testDeferred.promise.then(checkMocks);
    });

  });


  describe("Error", function() {

    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");
    var errorTopic = "error:wfm:sync:list:mockdatasetid";

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      list: sinon.stub().rejects(expectedTopicError)
    };

    beforeEach(function() {
      mockDatasetManager.list.reset();
      this.createMocks(mockDatasetManager, listTopic);
    });

    function checkMocks(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.list);
    }

    it("should handle no unique topic id", function() {
      var testDeferred = q.defer();
      this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

      mediator.publish(listTopic);

      return testDeferred.promise.then(checkMocks);
    });

    it("should handle a unique topic id", function() {
      var testDeferred = q.defer();

      var topicUid = shortid;
      var expectedErrorTopic = errorTopic + ":" + topicUid;

      this.subscribers[errorTopic] = mediator.subscribe(expectedErrorTopic, testDeferred.resolve);

      mediator.publish(listTopic, {
        topicUid: topicUid
      });

      return testDeferred.promise.then(checkMocks);
    });

  });
});