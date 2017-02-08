var topicGenerators = require('../topic-generators');
var CONSTANTS = require('../../constants');


/**
 *
 * Creating a subscriber to the update topic for a single data set.
 *
 * @param {Mediator} mediator         - The mediator used for subscriptions.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the update topic
 */
module.exports = function subscribeToUpdateTopic(mediator, datasetManager) {

  var updateTopic = topicGenerators.createTopic({
    topicName: CONSTANTS.TOPICS.UPDATE,
    datasetId: datasetManager.datasetId
  });

  /**
   *
   * Handling the update topic for this dataset.
   *
   * @param parameters
   * @param parameters.topicUid     - (Optional)  A unique ID to be used to publish completion / error topics.
   * @param parameters.itemToUpdate - The Dataset Item To Update
   */
  function handleUpdateTopic(parameters) {
    parameters = parameters || {};

    //Creating the item in the sync store
    datasetManager.update(parameters.itemToUpdate).then(function(updatedDataSetItem) {
      var creatDoneTopic = topicGenerators.doneTopic({
        topicName: CONSTANTS.TOPICS.UPDATE,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(creatDoneTopic, updatedDataSetItem);

    }).catch(function(error) {

      var errorCreateTopic = topicGenerators.errorTopic({
        topicName: CONSTANTS.TOPICS.UPDATE,
        datasetId: datasetManager.datasetId,
        topicUid: parameters.topicUid
      });

      mediator.publish(errorCreateTopic, error);
    });
  }

  return mediator.subscribe(updateTopic, handleUpdateTopic);
};