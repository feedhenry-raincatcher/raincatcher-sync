var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var expect = chai.expect;

describe("Sync List Mediator Topic", function() {
  var getListTopicSubscriber = require('./list');
  var listTopic = "wfm:sync:list:mockdatasetid";

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.mockDataItem = {
      id: "mockdataitemid",
      name: "This is a mock data item"
    };

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

  it("List Dataset Item - No Error", function() {
    var self = this;
    var testDeferred = q.defer();

    var arrayOfDataItems = [self.mockDataItem];

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      list: sinon.stub().resolves(arrayOfDataItems)
    };

    this.createMocks(mockDatasetManager, listTopic);

    var doneTopic = "done:wfm:sync:list:mockdatasetid";

    this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

    mediator.publish(listTopic);

    return testDeferred.promise.then(function(listResult) {
      expect(listResult).to.deep.equal(arrayOfDataItems);

      sinon.assert.calledOnce(mockDatasetManager.list);
    });
  });

  it("List Dataset Item - Error", function() {
    var testDeferred = q.defer();
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      list: sinon.stub().rejects(expectedTopicError)
    };

    this.createMocks(mockDatasetManager, listTopic);

    var errorTopic = "error:wfm:sync:list:mockdatasetid";

    this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

    mediator.publish(listTopic, this.mockDataToUpdate);

    return testDeferred.promise.then(function(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.list);
      sinon.assert.calledWith(mockDatasetManager.list);
    });
  });
});