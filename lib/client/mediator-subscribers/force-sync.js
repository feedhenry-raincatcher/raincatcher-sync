var topicGenerators = require('../topic-generators');
var CONSTANTS = require('../../constants');


/**
 *
 * Creating a subscriber to the force_sync topic for a single data set.
 *
 * @param {Mediator} mediator         - The mediator used for subscriptions.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the force_sync topic
 */
module.exports = function subscribeToForceSyncTopic(mediator, datasetManager) {

  var forceSyncTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.FORCE_SYNC,
    datasetId: datasetManager.datasetId
  });


  /**
   * Handling the force_sync topic for this dataset.
   *
   * @param {object} parameters
   * @param {string/number} parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   */
  function handleForceSync(parameters) {
    parameters = parameters || {};

    //Creating the item in the sync store
    datasetManager.forceSync().then(function() {
      var forceSyncDoneTopic = topicGenerators.doneTopic({
        topicName: CONSTANTS.TOPICS.FORCE_SYNC,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(forceSyncDoneTopic);

    }).catch(function(error) {

      var forceSyncErrorTopic = topicGenerators.errorTopic({
        topicName: CONSTANTS.TOPICS.FORCE_SYNC,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(forceSyncErrorTopic, error);
    });
  }


  return mediator.subscribe(forceSyncTopic, handleForceSync);
};