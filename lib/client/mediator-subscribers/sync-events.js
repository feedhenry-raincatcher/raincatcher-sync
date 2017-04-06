var CONSTANTS = require('../../constants');
  /**
 * Initialsing a subscriber for sync events.
 */
module.exports = function syncEventSubscriber(datasetManager) {

  /**
   * Handling the sync events
   *
   * @param {object} parameters
   */
  return function handleSyncEventTopics(parameters) {
    if (parameters && parameters.uid && parameters.message && parameters.code !== CONSTANTS.SYNC_TOPICS.SYNC_COMPLETE) {
      datasetManager.addEvent(parameters);
    }
  };
};
