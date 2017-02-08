var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var expect = chai.expect;

describe("Sync Read Mediator Topic", function() {
  var getReadTopicSubscriber = require('./read');
  var readTopic = "wfm:sync:read:mockdatasetid";

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.mockDataItem = {
      id: "mockdataitemid",
      name: "This is a mock data item"
    };

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

  it("Read Dataset Item - No Error", function() {
    var self = this;
    var testDeferred = q.defer();

    var arrayOfDataItems = [self.mockDataItem];

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      read: sinon.stub().resolves(arrayOfDataItems)
    };

    this.createMocks(mockDatasetManager, readTopic);

    var doneTopic = "done:wfm:sync:read:mockdatasetid:mockdataitemid";

    this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

    mediator.publish(readTopic, self.mockDataItem.id);

    return testDeferred.promise.then(function(readResult) {
      expect(readResult).to.deep.equal(arrayOfDataItems);

      sinon.assert.calledOnce(mockDatasetManager.read);
      sinon.assert.calledWith(mockDatasetManager.read, sinon.match(self.mockDataItem.id));
    });
  });

  it("Read Dataset Item - Error", function() {
    var testDeferred = q.defer();
    var self = this;
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      read: sinon.stub().rejects(expectedTopicError)
    };

    this.createMocks(mockDatasetManager, readTopic);

    var errorTopic = "error:wfm:sync:read:mockdatasetid:mockdataitemid";

    this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

    mediator.publish(readTopic, self.mockDataItem.id);

    return testDeferred.promise.then(function(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.read);
      sinon.assert.calledWith(mockDatasetManager.read, sinon.match(self.mockDataItem.id));
    });
  });
});