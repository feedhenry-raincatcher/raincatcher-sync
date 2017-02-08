var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var q = require('q');

describe("Sync Remove Item Mediator Topic", function() {
  var getRemoveDataSetItemSubscriber = require('./remove');
  var removeTopic = "wfm:sync:remove:mockdatasetid";
  var mockDatasetId = "mockdatasetid";

  var mockItemID = "mockdataitemid";

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

    self.createMocks = function(mockDataManager, topic) {
      self.topic = topic;
      self.updateSubscriber = getRemoveDataSetItemSubscriber(mediator, mockDataManager);
    };
  });

  //Removing the subscribers when finished a test.
  afterEach(function() {
    mediator.remove(this.topic, this.updateSubscriber.id);

    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });
  });

  it("Remove Dataset Item - No Error", function() {
    var testDeferred = q.defer();
    var mockDatasetManager = {
      datasetId: mockDatasetId,
      delete: sinon.stub().resolves(this.mockDataToUpdate)
    };

    this.createMocks(mockDatasetManager, removeTopic);

    var doneTopic = "done:wfm:sync:remove:mockdatasetid:mockdataitemid";

    this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

    mediator.publish(removeTopic, mockItemID);

    return testDeferred.promise.then(function(createResult) {
      expect(createResult).to.deep.equal(createResult);

      sinon.assert.calledOnce(mockDatasetManager.delete);
      sinon.assert.calledWith(mockDatasetManager.delete, sinon.match({id: sinon.match(mockItemID)}));
    });
  });

  it("Remove Dataset Item - Error", function() {
    var testDeferred = q.defer();
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    var mockDatasetManager = {
      datasetId: mockDatasetId,
      delete: sinon.stub().rejects(expectedTopicError)
    };

    this.createMocks(mockDatasetManager, removeTopic);

    var errorTopic = "error:wfm:sync:remove:mockdatasetid:mockdataitemid";

    this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

    mediator.publish(removeTopic, mockItemID);

    return testDeferred.promise.then(function(topicError) {
      expect(topicError).to.deep.equal(expectedTopicError);

      sinon.assert.calledOnce(mockDatasetManager.delete);
      sinon.assert.calledWith(mockDatasetManager.delete, sinon.match({id: sinon.match(mockItemID)}));
    });
  });
});