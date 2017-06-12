
/**
 *
 * Creating a subscriber to the create topic for a single data set.
 *
 * @param {object} syncDatasetTopics       - The sync topic subscribers for a data set.
 * @param {DataManager} datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {Subscription} - The subscription for the create topic
 */
module.exports = function subscribeToCreateTopic(syncDatasetTopics, datasetManager) {


  /**
   *
   * Handler for the data sync create topic for this dataset.
   *
   * @param {object} parameters
   * @param {object} parameters.itemToCreate - The item to create.
   */
  return function handleCreateTopic(parameters) {
    parameters = parameters || {};
    var datasetItemToCreate = parameters.itemToCreate;

    // remove _syncStatus, it can cause sync loop when updated and this data is irrelevant outside client
    delete datasetItemToCreate._syncStatus;

    //Creating a data item for this dataset.
    return datasetManager.create(datasetItemToCreate);
  };
};