var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var expect = chai.expect;

describe("Sync Update Mediator Topic", function() {
  var getUpdateTopicSubscriber = require('./update');
  var updateTopic = "wfm:sync:update:mockdatasetid";

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.mockDataToUpdate = {
      id: "mockdataitemid",
      name: "This is a mock data item"
    };

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.updateSubscriber = getUpdateTopicSubscriber(mediator, mockDataManager);
    };
  });

  //Removing the subscribers when finished a test.
  afterEach(function() {
    mediator.remove(this.topic, this.updateSubscriber.id);

    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });

  it("Update Dataset Item - No Error", function() {
    var testDeferred = q.defer();
    var self = this;

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      update: sinon.stub().resolves(this.mockDataToUpdate)
    };

    this.createMocks(mockDatasetManager, updateTopic);

    var doneTopic = "done:wfm:sync:update:mockdatasetid:mockdataitemid";

    this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

    mediator.publish(updateTopic, this.mockDataToUpdate);

    return testDeferred.promise.then(function(updateResult) {
      expect(updateResult).to.deep.equal(updateResult);

      sinon.assert.calledOnce(mockDatasetManager.update);
      sinon.assert.calledWith(mockDatasetManager.update, sinon.match(self.mockDataToUpdate));
    });
  });

  it("Update Dataset Item - Error", function() {
    var testDeferred = q.defer();
    var self = this;
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      update: sinon.stub().rejects(expectedTopicError)
    };

    this.createMocks(mockDatasetManager, updateTopic);

    var errorTopic = "error:wfm:sync:update:mockdatasetid:mockdataitemid";

    this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

    mediator.publish(updateTopic, this.mockDataToUpdate);

    return testDeferred.promise.then(function(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.update);
      sinon.assert.calledWith(mockDatasetManager.update, sinon.match(self.mockDataToUpdate));
    });
  });
});