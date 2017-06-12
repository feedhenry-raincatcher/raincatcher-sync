var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var chai = require('chai');
var _ = require('lodash');
var expect = chai.expect;
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var CONSTANTS = require('../../constants');


describe("Sync Update Mediator Topic", function() {
  var updateTopic = "wfm:sync:mockdatasetid:update";

  var mockDataToUpdate = {
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

  describe("Update Dataset Item", function() {

    describe("Handling A Successful Update", function() {

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
        syncSubscribers.on(CONSTANTS.TOPICS.UPDATE, require('./update')(syncSubscribers, mockDatasetManager));
      });


      it("update", function() {

        return mediator.publish(updateTopic, {itemToUpdate: mockDataToUpdate}).then(checkMocksCalled);
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

        syncSubscribers.on(CONSTANTS.TOPICS.UPDATE, require('./update')(syncSubscribers, mockDatasetManager));
      });

      it("update", function() {
        return mediator.publish(updateTopic, {itemToUpdate: mockDataToUpdate}).catch(checkErrorMocksCalled);
      });

    });

  });
});