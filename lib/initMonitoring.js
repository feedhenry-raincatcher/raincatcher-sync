/**
 * Created by darachcawley on 24/04/2017.
 */
var config = require('./config');

var session=require("rhmap-stats").init({
    host: config.monitoringHost,
    port: config.monitoringPort
});
module.exports=session;