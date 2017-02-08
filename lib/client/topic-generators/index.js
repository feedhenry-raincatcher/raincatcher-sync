var CONSTANTS = require('../../constants');

/**
 *
 * Generating a topic
 *
 * @param topicOptions
 * @param topicOptions.prefix    - The topic prefix (error, done)
 * @param topicOptions.datasetId - The ID of the dataset to publish for
 * @param topicOptions.topicName - The name of the dataset
 * @param topicOptions.topicUid  - The unique ID of the topic being publisheds
 * @returns {string}
 */
function createTopic(topicOptions) {

  var mediatorTopicPrefix = CONSTANTS.TOPIC_PREFIX;
  var syncTopicPrefix = CONSTANTS.SYNC_TOPIC_PREFIX;
  var topicSeparater = CONSTANTS.TOPIC_SEPARATOR;

  var prefix = topicOptions.prefix;
  var datasetId = topicOptions.datasetId;
  var topicUid = topicOptions.topicUid;
  var topicName = topicOptions.topicName;

  var fullTopic = "";

  if (prefix) {
    fullTopic = [prefix, mediatorTopicPrefix, syncTopicPrefix, topicName, datasetId].join(topicSeparater);
  } else {
    fullTopic = [mediatorTopicPrefix, syncTopicPrefix, topicName, datasetId].join(topicSeparater);
  }


  if (topicUid) {
    fullTopic = [fullTopic, topicUid].join(topicSeparater);
  }

  return fullTopic;
}

module.exports.createTopic = createTopic;

/**
 *
 * Generating an error topic
 *
 * @param topicOptions
 * @param topicOptions.datasetId - The ID of the dataset to publish for
 * @param topicOptions.topicName - The name of the dataset
 * @param topicOptions.topicUid  - The unique ID of the topic being published
 * @returns {string}
 */
module.exports.errorTopic = function generateErrorMediatorTopic(topicOptions) {

  topicOptions.prefix = CONSTANTS.ERROR_PREFIX;
  return createTopic(topicOptions);
};

/**
 *
 * Generating a completion topic
 *
 * @param topicOptions
 * @param topicOptions.datasetId - The ID of the dataset to publish for
 * @param topicOptions.topicName - The name of the dataset
 * @param topicOptions.topicUid  - The unique ID of the topic being published
 * @returns {string}
 */
module.exports.doneTopic = function generateDoneMediatorTopic(topicOptions) {
  topicOptions.prefix = CONSTANTS.DONE_PREFIX;
  return createTopic(topicOptions);
};
