var mediator = require("fh-wfm-mediator/lib/mediator");
var sinon = require('sinon');
require("sinon-as-promised");
var _ = require('lodash');
var MediatorTopicUtility = require('fh-wfm-mediator/lib/topics');
var CONSTANTS = require('../../constants');

describe("Sync Remove Mediator Topic", function() {
  var readTopic = "wfm:sync:mockdatasetid:remove";

  var mockDataItem = {
    id: "mockdataitemid",
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

  describe("No Error", function() {

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      delete: sinon.stub().resolves()
    };

    function checkMocks() {

      sinon.assert.calledOnce(mockDatasetManager.delete);
      sinon.assert.calledWith(mockDatasetManager.delete, sinon.match({id: mockDataItem.id}));
    }


    beforeEach(function() {
      mockDatasetManager.delete.reset();
      syncSubscribers.on(CONSTANTS.TOPICS.REMOVE, require('./remove')(syncSubscribers, mockDatasetManager));
    });

    it("remove", function() {

      return mediator.publish(readTopic, {
        id: mockDataItem.id
      }).then(checkMocks);
    });

  });


  describe("Error", function() {
    var expectedTopicError = new Error("SYNC-Error-Code : Sync Error Message");

    function checkMocks() {
      sinon.assert.calledOnce(mockDatasetManager.delete);
      sinon.assert.calledWith(mockDatasetManager.delete, sinon.match({id: mockDataItem.id}));
    }

    var mockDatasetManager = {
      datasetId: "mockdatasetid",
      delete: sinon.stub().rejects(expectedTopicError)
    };

    beforeEach(function() {
      mockDatasetManager.delete.reset();
      syncSubscribers.on(CONSTANTS.TOPICS.REMOVE, require('./remove')(syncSubscribers, mockDatasetManager));
    });

    it("remove", function() {
      return mediator.publish(readTopic, {
        id: mockDataItem.id
      }).catch(checkMocks);
    });

  });


});