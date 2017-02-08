var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var q = require('q');
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

  it("Force Sync A Dataset - No Error", function() {
    var testDeferred = q.defer();

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      forceSync: sinon.stub().resolves()
    };

    this.createMocks(mockDatasetManager, forceSyncTopic);

    var doneTopic = "done:wfm:sync:force_sync:mockdatasetid";

    this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

    mediator.publish(forceSyncTopic);

    return testDeferred.promise.then(function() {
      sinon.assert.calledOnce(mockDatasetManager.forceSync);
    });
  });

  it("Force Sync A Dataset - Error", function() {
    var testDeferred = q.defer();
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      forceSync: sinon.stub().rejects(expectedTopicError)
    };

    this.createMocks(mockDatasetManager, forceSyncTopic);

    var errorTopic = "error:wfm:sync:force_sync:mockdatasetid";

    this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

    mediator.publish(forceSyncTopic, this.mockDataToUpdate);

    return testDeferred.promise.then(function(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.forceSync);
    });
  });
});