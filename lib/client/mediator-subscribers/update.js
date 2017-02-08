var topicGenerators = require('../topic-generators');

module.exports = function subscribeToUpdateTopic(mediator, datasetManager) {
  var topicName = "update";

  //Subscribing to the create topic for this dataset. TODO Config
  var updateTopic = topicGenerators.createTopic({
    topicName: topicName,
    datasetId: datasetManager.datasetId
  });

  return mediator.subscribe(updateTopic, function(datasetItemToUpdate) {

    //Creating the item in the sync store
    datasetManager.update(datasetItemToUpdate).then(function(updatedDataSetItem) {
      var creatDoneTopic = topicGenerators.doneTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId,
        datasetItemId: updatedDataSetItem.id
      });

      mediator.publish(creatDoneTopic, updatedDataSetItem);

    }).catch(function(error) {

      var errorCreateTopic = topicGenerators.errorTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId,
        datasetItemId: datasetItemToUpdate.id
      });

      mediator.publish(errorCreateTopic, error);
    });
  });
};