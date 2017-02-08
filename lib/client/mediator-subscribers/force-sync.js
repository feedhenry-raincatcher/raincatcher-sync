var topicGenerators = require('../topic-generators');

module.exports = function subscribeToForceSyncTopic(mediator, datasetManager) {
  var topicName = "force_sync";

  var forceSyncTopic = topicGenerators.createTopic({
    topicName: topicName,
    datasetId: datasetManager.datasetId
  });

  return mediator.subscribe(forceSyncTopic, function() {

    //Creating the item in the sync store
    datasetManager.forceSync().then(function() {
      var forceSyncDoneTopic = topicGenerators.doneTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId
      });

      mediator.publish(forceSyncDoneTopic);

    }).catch(function(error) {

      var forceSyncErrorTopic = topicGenerators.errorTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId
      });

      mediator.publish(forceSyncErrorTopic, error);
    });
  });
};