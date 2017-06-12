
/**
 *
 * Creating a subscriber to the force_sync topic for a single data set.
 *
 * @param {Mediator} syncDatasetTopics         -  The sync topic subscribers for a data set.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the force_sync topic
 */
module.exports = function subscribeToForceSyncTopic(syncDatasetTopics, datasetManager) {


  /**
   * Handling the force_sync topic for this dataset.
   *
   */
  return function handleForceSync() {

    //Creating the item in the sync store
    return datasetManager.forceSync();
  };
};