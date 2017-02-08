var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var q = require('q');
var shortid = require('shortid');

describe("Sync Update Mediator Topic", function() {
  var getUpdateTopicSubscriber = require('./update');
  var updateTopic = "wfm:sync:update:mockdatasetid";

  var mockDataToUpdate = {
    name: "This is a mock data item"
  };

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

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

  describe("Update Dataset Item", function() {

    describe("Handling A Successful Update", function() {

      var doneTopic = "done:wfm:sync:update:mockdatasetid";

      var mockDatasetManager = {
        datasetId: "mockdatasetid",
        update: sinon.stub().resolves(mockDataToUpdate)
      };

      //Verifying the mocks were called with the correct parameters.
      function checkMocksCalled(updateResult) {
        expect(updateResult).to.deep.equal(mockDataToUpdate);

        sinon.assert.calledOnce(mockDatasetManager.update);
        sinon.assert.calledWith(mockDatasetManager.update, sinon.match(mockDataToUpdate));
      }

      beforeEach(function() {
        mockDatasetManager.update.reset();
        this.createMocks(mockDatasetManager, updateTopic);
      });


      it("should handle no unique topic id", function() {
        var testDeferred = q.defer();

        this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

        mediator.publish(updateTopic, {itemToUpdate: mockDataToUpdate});

        return testDeferred.promise.then(checkMocksCalled);
      });

      it("should handle unique topic id", function() {
        var testDeferred = q.defer();

        var topicUid = shortid.generate();

        this.subscribers[doneTopic] = mediator.subscribe(doneTopic + ":" + topicUid, testDeferred.resolve);

        mediator.publish(updateTopic, {
          itemToUpdate: mockDataToUpdate,
          topicUid: topicUid
        });

        return testDeferred.promise.then(checkMocksCalled);
      });

    });

    describe("Handling the error case", function() {

      var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

      var mockDatasetManager = {
        datasetId: "mockdatasetid",
        update: sinon.stub().rejects(expectedTopicError)
      };

      function checkErrorMocksCalled(topicError) {
        expect(topicError).to.deep.equal(expectedTopicError);

        sinon.assert.calledOnce(mockDatasetManager.update);
        sinon.assert.calledWith(mockDatasetManager.update, sinon.match(mockDataToUpdate));
      }

      beforeEach(function() {
        mockDatasetManager.update.reset();

        this.createMocks(mockDatasetManager, updateTopic);
      });

      it("should handle no unique topic id", function() {
        var testDeferred = q.defer();


        var errorTopic = "error:wfm:sync:update:mockdatasetid";

        this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

        mediator.publish(updateTopic, {itemToUpdate: mockDataToUpdate});

        return testDeferred.promise.then(checkErrorMocksCalled);
      });

      it("should handle a unique topic id", function() {
        var testDeferred = q.defer();

        var topicUid = shortid.generate();

        var errorTopic = "error:wfm:sync:update:mockdatasetid:" + topicUid;

        this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

        mediator.publish(updateTopic, {
          itemToUpdate: mockDataToUpdate,
          topicUid: topicUid
        });

        return testDeferred.promise.then(checkErrorMocksCalled);
      });

    });

  });
});