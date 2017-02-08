var topicGenerators = require('../topic-generators');

module.exports = function subscribeToListTopic(mediator, datasetManager) {
  var topicName = "list";

  var listTopic = topicGenerators.createTopic({
    topicName: topicName,
    datasetId: datasetManager.datasetId
  });

  return mediator.subscribe(listTopic, function() {

    //Creating the item in the sync store
    datasetManager.list().then(function(arrayOfDatasetItems) {
      var listDoneTopic = topicGenerators.doneTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId
      });

      mediator.publish(listDoneTopic, arrayOfDatasetItems);

    }).catch(function(error) {

      var listErrorTopic = topicGenerators.errorTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId
      });

      mediator.publish(listErrorTopic, error);
    });
  });
};