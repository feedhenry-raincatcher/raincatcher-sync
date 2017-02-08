var topicGenerators = require('../topic-generators');

module.exports = function subscribeToStartSyncTopic(mediator, datasetManager) {
  var topicName = "stop";

  var stopDatasetSyncTopic = topicGenerators.createTopic({
    topicName: topicName,
    datasetId: datasetManager.datasetId
  });

  return mediator.subscribe(stopDatasetSyncTopic, function() {

    datasetManager.stop().then(function() {
      var stopDatasetSyncTopic = topicGenerators.doneTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId
      });

      mediator.publish(stopDatasetSyncTopic);

    }).catch(function(error) {

      var stopDatasetSyncTopic = topicGenerators.errorTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId
      });

      mediator.publish(stopDatasetSyncTopic, error);
    });
  });
};