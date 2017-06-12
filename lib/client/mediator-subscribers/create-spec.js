var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var CONSTANTS = require('../../constants');
var expect = chai.expect;
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');

describe("Sync Create Mediator Topic", function() {
  var createTopic = "wfm:sync:mockdatasetid:create";

  var mockDataToCreate = {
    name: "This is a mock data item"
  };

  var mockDatasetId = "mockdatasetid";

  var syncSubscribers = new MediatorTopicUtility(mediator);
  syncSubscribers.prefix(CONSTANTS.SYNC_TOPIC_PREFIX).entity(mockDatasetId);

  beforeEach(function() {
    this.subscribers = {};
  });

  afterEach(function() {
    _.each(this.subscribers, function(subscriber, topic) {
      mediator.remove(topic, subscriber.id);
    });

    syncSubscribers.unsubscribeAll();
  });

  describe("Create Dataset Item", function() {

    describe("Handling A Successful Creation", function() {

      var mockDatasetManager = {
        datasetId: mockDatasetId,
        create: sinon.stub().resolves(mockDataToCreate)
      };

      beforeEach(function() {
        syncSubscribers.on(CONSTANTS.TOPICS.CREATE, require('./create')(syncSubscribers, mockDatasetManager));
      });

      //Verifying the mocks were called with the correct parameters.
      function checkMocksCalled(createResult) {
        expect(createResult).to.deep.equal(createResult);

        sinon.assert.calledOnce(mockDatasetManager.create);
        sinon.assert.calledWith(mockDatasetManager.create, sinon.match(mockDataToCreate));
      }

      beforeEach(function() {
        mockDatasetManager.create.reset();
      });


      it("create", function() {
        return mediator.publish(createTopic, {itemToCreate: mockDataToCreate}).then(checkMocksCalled);
      });

    });

    describe("Handling the error case", function() {

      var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

      var mockDatasetManager = {
        datasetId: mockDatasetId,
        create: sinon.stub().rejects(expectedTopicError)
      };


      function checkErrorMocksCalled(topicError) {
        expect(topicError).to.deep.equal(expectedTopicError);

        sinon.assert.calledOnce(mockDatasetManager.create);
        sinon.assert.calledWith(mockDatasetManager.create, sinon.match(mockDataToCreate));
      }

      beforeEach(function() {
        mockDatasetManager.create.reset();

        syncSubscribers.on(CONSTANTS.TOPICS.CREATE, require('./create')(syncSubscribers, mockDatasetManager));
      });

      it("create", function() {
        return mediator.publish(createTopic, {itemToCreate: mockDataToCreate}).catch(checkErrorMocksCalled);
      });

    });

  });
});