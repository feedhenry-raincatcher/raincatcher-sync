var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
var expect = chai.expect;

describe("Sync Stop Mediator Topic", function() {
  var getStartSyncSubscriber = require('./stop');
  var startSyncTopic = "wfm:sync:stop:mockdatasetid";

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.updateSubscriber = getStartSyncSubscriber(mediator, mockDataManager);
    };
  });

  //Removing the subscribers when finished a test.
  afterEach(function() {
    mediator.remove(this.topic, this.updateSubscriber.id);

    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });

  it("Stop Sync A Dataset - No Error", function() {
    var testDeferred = q.defer();

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      stop: sinon.stub().resolves()
    };

    this.createMocks(mockDatasetManager, startSyncTopic);

    var doneTopic = "done:wfm:sync:stop:mockdatasetid";

    this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

    mediator.publish(startSyncTopic);

    return testDeferred.promise.then(function() {
      sinon.assert.calledOnce(mockDatasetManager.stop);
    });
  });

  it("Stop Sync A Dataset - Error", function() {
    var testDeferred = q.defer();
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      stop: sinon.stub().rejects(expectedTopicError)
    };

    this.createMocks(mockDatasetManager, startSyncTopic);

    var errorTopic = "error:wfm:sync:stop:mockdatasetid";

    this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

    mediator.publish(startSyncTopic, this.mockDataToUpdate);

    return testDeferred.promise.then(function(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.stop);
    });
  });
});