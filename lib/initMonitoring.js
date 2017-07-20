/**
 * Created by darachcawley on 24/04/2017.
 */
var config = require('./config');

var session=require("rhmap-stats").init({
    host: config.get('monitoringHost'),
    port: config.get('monitoringPort')
});
module.exports=session;