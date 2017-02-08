var topicGenerators = require('../topic-generators');
var CONSTANTS = require('../../constants');


/**
 *
 * Creating a subscriber to the stop topic for a single data set.
 *
 * @param {Mediator} mediator         - The mediator used for subscriptions.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the stop topic
 */
module.exports = function subscribeToStartSyncTopic(mediator, datasetManager) {

  var stopDatasetSyncTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.STOP,
    datasetId: datasetManager.datasetId
  });

  /**
   * Handling the stop topic for this dataset.
   *
   * @param parameters
   * @param parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   */
  function handleStopTopic(parameters) {
    parameters = parameters || {};

    datasetManager.stop().then(function() {
      var stopDatasetSyncTopic = topicGenerators.doneTopic({
        topicName: CONSTANTS.TOPICS.STOP,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(stopDatasetSyncTopic);

    }).catch(function(error) {

      var stopDatasetSyncTopic = topicGenerators.errorTopic({
        topicName: CONSTANTS.TOPICS.STOP,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(stopDatasetSyncTopic, error);
    });
  }

  return mediator.subscribe(stopDatasetSyncTopic, handleStopTopic);
};