
/**
 *
 * Creating a subscriber to the list topic for a single data set.
 *
 * @param {Mediator} syncDatasetTopics         - The sync topic subscribers for a data set.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the list topic
 */
module.exports = function subscribeToListTopic(syncDatasetTopics, datasetManager) {

  /**
   * Handling the list topic for this dataset.
   *
   */
  return function handleListTopic() {

    return datasetManager.getMetaData().then(function(metadata) {
      return datasetManager.list().then(function(arrayOfDatasetItems) {

        if (metadata.syncEvents) {
          arrayOfDatasetItems.forEach(function(item) {
            item._syncStatus = metadata.syncEvents[item.id];
          });
        }
        return arrayOfDatasetItems;
      });
    });

  };

};