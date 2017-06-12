

/**
 *
 * Creating a subscriber to the remove topic for a single data set.
 *
 * @param {Mediator} syncDatasetTopics         - The sync topic subscribers for a data set.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the remove topic
 */
module.exports = function subscribeToRemoveTopic(syncDatasetTopics, datasetManager) {

  /**
   * Handling the remove topic for this dataset.
   *
   * @param parameters
   * @param parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   * @param parameters.id        - The ID of the item to read
   */
  return function handleRemoveTopic(parameters) {
    parameters = parameters || {};

    return datasetManager.delete({id: parameters.id});
  };
};