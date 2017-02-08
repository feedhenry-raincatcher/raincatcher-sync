var topicGenerators = require('../topic-generators');
var CONSTANTS = require('../../constants');


/**
 *
 * Creating a subscriber to the remove topic for a single data set.
 *
 * @param {Mediator} mediator         - The mediator used for subscriptions.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the remove topic
 */
module.exports = function subscribeToRemoveTopic(mediator, datasetManager) {
  var removeTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.REMOVE,
    datasetId: datasetManager.datasetId
  });

  /**
   * Handling the remove topic for this dataset.
   *
   * @param parameters
   * @param parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   * @param parameters.id        - The ID of the item to read
   */
  function handleRemoveTopic(parameters) {
    parameters = parameters || {};

    datasetManager.delete({id: parameters.id}).then(function() {
      var removeDoneTopic = topicGenerators.doneTopic({
        topicName: CONSTANTS.TOPICS.REMOVE,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(removeDoneTopic);

    }).catch(function(error) {

      var removeErrorTopic = topicGenerators.errorTopic({
        topicName: CONSTANTS.TOPICS.REMOVE,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(removeErrorTopic, error);
    });
  }

  return mediator.subscribe(removeTopic, handleRemoveTopic);
};