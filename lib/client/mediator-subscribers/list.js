var topicGenerators = require('../topic-generators');
var CONSTANTS = require('../../constants');


/**
 *
 * Creating a subscriber to the list topic for a single data set.
 *
 * @param {Mediator} mediator         - The mediator used for subscriptions.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the list topic
 */
module.exports = function subscribeToListTopic(mediator, datasetManager) {

  var listTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.LIST,
    datasetId: datasetManager.datasetId
  });

  /**
   * Handling the list topic for this dataset.
   *
   * @param parameters
   * @param parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   */
  function handleListTopic(parameters) {
    parameters = parameters || {};

    //Creating the item in the sync store
    datasetManager.list().then(function(arrayOfDatasetItems) {
      var listDoneTopic = topicGenerators.doneTopic({
        topicName: CONSTANTS.TOPICS.LIST,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(listDoneTopic, arrayOfDatasetItems);

    }).catch(function(error) {

      var listErrorTopic = topicGenerators.errorTopic({
        topicName: CONSTANTS.TOPICS.LIST,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(listErrorTopic, error);
    });
  }

  return mediator.subscribe(listTopic, handleListTopic);
};