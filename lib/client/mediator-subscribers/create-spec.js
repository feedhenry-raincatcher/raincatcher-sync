var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var q = require('q');

describe("Sync Create Mediator Topic", function() {
  var getCreateTopicSubscriber = require('./create');
  var createTopic = "wfm:sync:create:mockdatasetid";

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.mockDataToUpdate = {
      id: "mockdataitemid",
      name: "This is a mock data item"
    };

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.updateSubscriber = getCreateTopicSubscriber(mediator, mockDataManager);
    };
  });

  //Removing the subscribers when finished a test.
  afterEach(function() {
    mediator.remove(this.topic, this.updateSubscriber.id);

    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });

  it("Create Dataset Item - No Error", function() {
    var testDeferred = q.defer();
    var self = this;
    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      create: sinon.stub().resolves(this.mockDataToUpdate)
    };

    this.createMocks(mockDatasetManager, createTopic);

    var doneTopic = "done:wfm:sync:create:mockdatasetid:mockdataitemid";

    this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

    mediator.publish(createTopic, this.mockDataToUpdate);

    return testDeferred.promise.then(function(createResult) {
      expect(createResult).to.deep.equal(createResult);

      sinon.assert.calledOnce(mockDatasetManager.create);
      sinon.assert.calledWith(mockDatasetManager.create, sinon.match(self.mockDataToUpdate));
    });
  });

  it("Create Dataset Item - Error", function() {
    var testDeferred = q.defer();
    var self = this;
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      create: sinon.stub().rejects(expectedTopicError)
    };

    this.createMocks(mockDatasetManager, createTopic);

    var errorTopic = "error:wfm:sync:create:mockdatasetid:mockdataitemid";

    this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

    mediator.publish(createTopic, this.mockDataToUpdate);

    return testDeferred.promise.then(function(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.create);
      sinon.assert.calledWith(mockDatasetManager.create, sinon.match(self.mockDataToUpdate));
    });
  });
});