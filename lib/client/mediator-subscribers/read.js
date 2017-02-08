var topicGenerators = require('../topic-generators');
var CONSTANTS = require('../../constants');


/**
 *
 * Creating a subscriber to the read topic for a single data set.
 *
 * @param {Mediator} mediator         - The mediator used for subscriptions.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the read topic
 */
module.exports = function subscribeToReadTopic(mediator, datasetManager) {


  var readTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.READ,
    datasetId: datasetManager.datasetId
  });

  /**
   * Handling the read topic for this dataset.
   *
   * @param parameters
   * @param parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   * @param parameters.id        - The ID of the item to read
   */
  function handleReadTopic(parameters) {
    parameters = parameters || {};

    //Creating the item in the sync store
    datasetManager.read(parameters.id).then(function(itemRead) {
      var readDoneTopic = topicGenerators.doneTopic({
        topicName: CONSTANTS.TOPICS.READ,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(readDoneTopic, itemRead);

    }).catch(function(error) {

      var readErrorTopic = topicGenerators.errorTopic({
        topicName: CONSTANTS.TOPICS.READ,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(readErrorTopic, error);
    });
  }

  return mediator.subscribe(readTopic, handleReadTopic);
};