

/**
 *
 * Creating a subscriber to the read topic for a single data set.
 *
 * @param {Mediator} syncDatasetTopics         - The sync topic subscribers for a data set.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the read topic
 */
module.exports = function subscribeToReadTopic(syncDatasetTopics, datasetManager) {


  /**
   * Handling the read topic for this dataset.
   *
   * @param parameters
   * @param parameters.topicUid  - (Optional)  A unique ID to be used to publish completion / error topics.
   * @param parameters.id        - The ID of the item to read
   */
  return function handleReadTopic(parameters) {
    parameters = parameters || {};

    //Reading the item in the sync store
    return datasetManager.getMetaData().then(function(metadata) {
      return datasetManager.read(parameters.id).then(function(itemRead) {
        if (metadata.syncEvents) {
          itemRead._syncStatus = metadata.syncEvents[itemRead.id];
        }

        return itemRead;
      });
    });
  };
};