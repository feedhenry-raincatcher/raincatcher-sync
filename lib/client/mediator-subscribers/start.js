var topicGenerators = require('../topic-generators');
var CONSTANTS = require('../../constants');



/**
 *
 * Creating a subscriber to the start topic for a single data set.
 *
 * @param {Mediator} mediator         - The mediator used for subscriptions.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the start topic
 */
module.exports = function subscribeToStartSyncTopic(mediator, datasetManager) {
  var startDatasetSyncTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.START,
    datasetId: datasetManager.datasetId
  });

  /**
   * Handling the start topic for this dataset.
   *
   * @param parameters
   * @param parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   */
  function handleStartTopic(parameters) {
    parameters = parameters || {};

    datasetManager.start().then(function() {
      var startDatasetSyncTopic = topicGenerators.doneTopic({
        topicName: CONSTANTS.TOPICS.START,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(startDatasetSyncTopic);

    }).catch(function(error) {

      var startDatasetSyncTopic = topicGenerators.errorTopic({
        topicName: CONSTANTS.TOPICS.START,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(startDatasetSyncTopic, error);
    });
  }

  return mediator.subscribe(startDatasetSyncTopic, handleStartTopic);
};