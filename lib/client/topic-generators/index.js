

/**
 *
 * Generating a topic
 *
 * @param topicOptions
 * @param topicOptions.prefix    - The topic prefix (error, done)
 * @param topicOptions.datasetId - The ID of the dataset to publish for
 * @param topicOptions.topicName - The name of the dataset
 * @param topicOptions.datasetItemId - The unique ID of the topic being published.s
 * @returns {string}
 */
function createTopic(topicOptions) {

  //TODO, move to config
  var mediatorTopicPrefix = "wfm";
  var syncTopicPrefix = "sync";
  var topicSeparater = ":";

  var prefix = topicOptions.prefix;
  var datasetId = topicOptions.datasetId;
  var datasetItemId = topicOptions.datasetItemId;
  var topicName = topicOptions.topicName;

  var fullTopic = "";

  if (prefix) {
    fullTopic = [prefix, mediatorTopicPrefix, syncTopicPrefix, topicName, datasetId].join(topicSeparater);
  } else {
    fullTopic = [mediatorTopicPrefix, syncTopicPrefix, topicName, datasetId].join(topicSeparater);
  }


  if (datasetItemId) {
    fullTopic = [fullTopic, datasetItemId].join(topicSeparater);
  }

  return fullTopic;
}

module.exports.createTopic = createTopic;

module.exports.errorTopic = function generateErrorMediatorTopic(topicOptions) {

  //TODO Config
  var errorTopicPrefix = "error";

  topicOptions.prefix = errorTopicPrefix;
  return createTopic(topicOptions);
};

module.exports.doneTopic = function generateDoneMediatorTopic(topicOptions) {

  //TODO: Config
  var doneTopicPrefix = "done";

  topicOptions.prefix = doneTopicPrefix;
  return createTopic(topicOptions);
};
