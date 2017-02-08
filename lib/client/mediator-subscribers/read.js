var topicGenerators = require('../topic-generators');

module.exports = function subscribeToReadTopic(mediator, datasetManager) {
  var topicName = "read";

  var readTopic = topicGenerators.createTopic({
    topicName: topicName,
    datasetId: datasetManager.datasetId
  });

  return mediator.subscribe(readTopic, function(itemIDToRead) {

    //Creating the item in the sync store
    datasetManager.read(itemIDToRead).then(function(itemRead) {
      var readDoneTopic = topicGenerators.doneTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId,
        datasetItemId: itemIDToRead
      });

      mediator.publish(readDoneTopic, itemRead);

    }).catch(function(error) {

      var readErrorTopic = topicGenerators.errorTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId,
        datasetItemId: itemIDToRead
      });

      mediator.publish(readErrorTopic, error);
    });
  });
};