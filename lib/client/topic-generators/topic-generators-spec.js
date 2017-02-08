var topicGenerators = require('./index');
var expect = require('chai').expect;

describe("Sync Topic Generator", function() {

  describe("createTopic", function() {

    it("No Item ID", function() {
      var generatedTopic = topicGenerators.createTopic({
        datasetId: "testdataset",
        topicName: "testtopicname"
      });

      expect(generatedTopic).to.equal("wfm:sync:testtopicname:testdataset");
    });

    it("Item ID", function() {
      var generatedTopic = topicGenerators.createTopic({
        datasetId: "testdataset",
        topicName: "testtopicname",
        datasetItemId: "testdatasetitemid"
      });

      expect(generatedTopic).to.equal("wfm:sync:testtopicname:testdataset:testdatasetitemid");
    });

  });

  describe("errorTopic", function() {

    it("No Item ID", function() {
      var generatedTopic = topicGenerators.errorTopic({
        datasetId: "testdataset",
        topicName: "testtopicname"
      });

      expect(generatedTopic).to.equal("error:wfm:sync:testtopicname:testdataset");
    });

    it("Item ID", function() {
      var generatedTopic = topicGenerators.errorTopic({
        datasetId: "testdataset",
        topicName: "testtopicname",
        datasetItemId: "testdatasetitemid"
      });

      expect(generatedTopic).to.equal("error:wfm:sync:testtopicname:testdataset:testdatasetitemid");
    });

  });

  describe("doneTopic", function() {

    it("No Item ID", function() {
      var generatedTopic = topicGenerators.doneTopic({
        datasetId: "testdataset",
        topicName: "testtopicname"
      });

      expect(generatedTopic).to.equal("done:wfm:sync:testtopicname:testdataset");
    });

    it("Item ID", function() {
      var generatedTopic = topicGenerators.doneTopic({
        datasetId: "testdataset",
        topicName: "testtopicname",
        datasetItemId: "testdatasetitemid"
      });

      expect(generatedTopic).to.equal("done:wfm:sync:testtopicname:testdataset:testdatasetitemid");
    });

  });

});