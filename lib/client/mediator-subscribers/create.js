var topicGenerators = require('../topic-generators');


/**
 *
 * Creating a subscriber to the create topic for a single data set.
 *
 * @param mediator         - The mediator used for subscriptions.
 * @param datasetManager   - The individual data set manager. This is where the business logic exists for
 * @returns {*}
 */
module.exports = function subscribeToCreateTopic(mediator, datasetManager) {
  var topicName = "create";

  //Subscribing to the create topic for this dataset.
  var createTopic = topicGenerators.createTopic({
    topicName: topicName,
    datasetId: datasetManager.datasetId
  });

  return mediator.subscribe(createTopic, function(datasetItemToCreate) {

    datasetManager.create(datasetItemToCreate).then(function(createdDatasetItem) {

      var creatDoneTopic = topicGenerators.doneTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId,
        datasetItemId: createdDatasetItem.id
      });

      mediator.publish(creatDoneTopic, createdDatasetItem);

    }).catch(function(error) {
      var errorCreateTopic = topicGenerators.errorTopic({
        topicName: topicName,
        datasetId: datasetManager.datasetId,
        datasetItemId: datasetItemToCreate.id
      });

      mediator.publish(errorCreateTopic, error);
    });
  });
};