var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var q = require('q');
var shortid = require('shortid');

describe("Sync Create Mediator Topic", function() {
  var getCreateTopicSubscriber = require('./create');
  var createTopic = "wfm:sync:create:mockdatasetid";

  var mockDataToCreate = {
    name: "This is a mock data item"
  };

  beforeEach(function() {
    var self = this;

    self.subscribers = {};

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

  describe("Create Dataset Item", function() {

    describe("Handling A Successful Creation", function() {

      var doneTopic = "done:wfm:sync:create:mockdatasetid";

      var mockDatasetManager = {
        datasetId: "mockdatasetid",
        create: sinon.stub().resolves(this.mockDataToUpdate)
      };

      //Verifying the mocks were called with the correct parameters.
      function checkMocksCalled(createResult) {
        expect(createResult).to.deep.equal(createResult);

        sinon.assert.calledOnce(mockDatasetManager.create);
        sinon.assert.calledWith(mockDatasetManager.create, sinon.match(mockDataToCreate));
      }

      beforeEach(function() {
        mockDatasetManager.create.reset();
        this.createMocks(mockDatasetManager, createTopic);
      });


      it("should handle no unique topic id", function() {
        var testDeferred = q.defer();

        this.subscribers[doneTopic] = mediator.subscribe(doneTopic, testDeferred.resolve);

        mediator.publish(createTopic, {itemToCreate: mockDataToCreate});

        return testDeferred.promise.then(checkMocksCalled);
      });

      it("should handle unique topic id", function() {
        var testDeferred = q.defer();

        var topicUid = shortid.generate();

        this.subscribers[doneTopic] = mediator.subscribe(doneTopic + ":" + topicUid, testDeferred.resolve);

        mediator.publish(createTopic, {
          itemToCreate: mockDataToCreate,
          topicUid: topicUid
        });

        return testDeferred.promise.then(checkMocksCalled);
      });

    });

    describe("Handling the error case", function() {

      var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

      var mockDatasetManager = {
        datasetId: "mockdatasetid",
        create: sinon.stub().rejects(expectedTopicError)
      };

      function checkErrorMocksCalled(topicError) {
        expect(topicError).to.deep.equal(expectedTopicError);

        sinon.assert.calledOnce(mockDatasetManager.create);
        sinon.assert.calledWith(mockDatasetManager.create, sinon.match(mockDataToCreate));
      }

      beforeEach(function() {
        mockDatasetManager.create.reset();

        this.createMocks(mockDatasetManager, createTopic);
      });

      it("should handle no unique topic id", function() {
        var testDeferred = q.defer();


        var errorTopic = "error:wfm:sync:create:mockdatasetid";

        this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

        mediator.publish(createTopic, {itemToCreate: mockDataToCreate});

        return testDeferred.promise.then(checkErrorMocksCalled);
      });

      it("should handle a unique topic id", function() {
        var testDeferred = q.defer();

        var topicUid = shortid.generate();

        var errorTopic = "error:wfm:sync:create:mockdatasetid:" + topicUid;

        this.subscribers[errorTopic] = mediator.subscribe(errorTopic, testDeferred.resolve);

        mediator.publish(createTopic, {
          itemToCreate: mockDataToCreate,
          topicUid: topicUid
        });

        return testDeferred.promise.then(checkErrorMocksCalled);
      });

    });

  });
});