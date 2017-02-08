var topicGenerators = require('../topic-generators');

module.exports = function subscribeToStartSyncTopic(mediator, datasetManager) {
  var topicName = "start";

  var startDatasetSyncTopic = topicGenerators.createTopic({
    topicName: topicName,
    datasetId: datasetManager.datasetId
  });

  return mediator.subscribe(startDatasetSyncTopic, function() {

    datasetManager.start().then(function() {
      var startDatasetSyncTopic = topicGenerators.doneTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId
      });

      mediator.publish(startDatasetSyncTopic);

    }).catch(function(error) {

      var startDatasetSyncTopic = topicGenerators.errorTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId
      });

      mediator.publish(startDatasetSyncTopic, error);
    });
  });
};