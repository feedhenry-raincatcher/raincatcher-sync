var topicGenerators = require('../topic-generators');

module.exports = function subscribeToRemoveTopic(mediator, datasetManager) {
  var topicName = "remove";

  var removeTopic = topicGenerators.createTopic({
    topicName: topicName,
    datasetId: datasetManager.datasetId
  });

  return mediator.subscribe(removeTopic, function(itemIdToDelete) {

    datasetManager.delete({id: itemIdToDelete}).then(function() {
      var removeDoneTopic = topicGenerators.doneTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId,
        datasetItemId: itemIdToDelete
      });

      mediator.publish(removeDoneTopic);

    }).catch(function(error) {

      var removeErrorTopic = topicGenerators.errorTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId,
        datasetItemId: itemIdToDelete
      });

      mediator.publish(removeErrorTopic, error);
    });
  });
};